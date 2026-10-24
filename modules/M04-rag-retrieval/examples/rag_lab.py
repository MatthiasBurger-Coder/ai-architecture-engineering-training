"""Offline reproducible RAG retrieval lab. Python >=3.10, no dependencies.

Toy hashing vectors are NOT trainable or semantic embedding models.
Lexical TF-IDF is NOT BM25; extractive answers are NOT LLM responses.
"""
from __future__ import annotations
from collections import Counter
from pathlib import Path
import hashlib
import json
import math
import re
import time

ROOT = Path(__file__).parent
def load(name):
    return json.loads((ROOT / name).read_text(encoding="utf-8"))

def tokens(text):
    return re.findall(r"[a-z0-9]+", text.lower())

def tfidf_vectors(docs):
    df = Counter(t for doc in docs for t in set(tokens(doc["text"])))
    n = len(docs)
    weights = {w: math.log((n+1)/(count+1))+1 for w,count in df.items()}
    return weights

def lexical(query, docs):
    weights = tfidf_vectors(docs)
    q = Counter(tokens(query))
    def score(doc):
        d = Counter(tokens(doc["text"]))
        return sum(q[t] * d[t] * weights.get(t,0)**2 for t in q)
    return sorted(((doc["id"], score(doc)) for doc in docs),key=lambda x:(-x[1],x[0]))

def vector(text, dimension=64):
    """Deterministic word-hash counts for pedagogical use, NOT real embeddings."""
    v = [0.0]*dimension
    for t in tokens(text):
        h = int.from_bytes(hashlib.sha256(t.encode()).digest()[:8],"big")
        v[h % dimension] += 1.0
    length = math.sqrt(sum(x*x for x in v))
    return [x/length for x in v] if length else v

def dense(query, docs):
    q=vector(query)
    return sorted(((d["id"],sum(a*b for a,b in zip(q,vector(d["text"])))) for d in docs),key=lambda x:(-x[1],x[0]))

def rrf(rankings,k=60):
    score={}
    for ranking in rankings:
        for i,(doc_id,_) in enumerate(ranking,1):
            score[doc_id]=score.get(doc_id,0)+1/(k+i)
    return sorted(score.items(),key=lambda x:(-x[1],x[0]))

def allowed(docs,scope):
    return [d for d in docs if d["scope"]=="public" or (scope=="internal" and d["scope"]=="internal")]

def retrieve(query,docs,scope="public",mode="hybrid",k=3):
    visible=allowed(docs,scope)
    if mode=="lexical": result=lexical(query,visible)
    elif mode=="dense": result=dense(query,visible)
    elif mode=="hybrid": result=rrf([lexical(query,visible),dense(query,visible)])
    else: raise ValueError("unknown mode")
    # zero-score candidates are not evidence for lexical/dense search
    if mode != "hybrid": result=[r for r in result if r[1]>0]
    return result[:k]

def context(query,docs,scope="public",mode="hybrid",k=3):
    found=retrieve(query,docs,scope,mode,k)
    by_id={d["id"]:d for d in allowed(docs,scope)}
    return [{"citation":key,"text":by_id[key]["text"],"source":by_id[key]["source"]} for key,_ in found]

def metrics(queries,docs,mode,k=3):
    hits=0; recall=0.; rr=0.; durations=[]
    for item in queries:
        start=time.perf_counter()
        ids=[doc_id for doc_id,_ in retrieve(item["query"],docs,item["scope"],mode,k)]
        durations.append((time.perf_counter()-start)*1000)
        gold=set(item["relevant"])
        matches=len(gold.intersection(ids))
        hits+=int(matches>0)
        recall+=matches/len(gold)
        rr+=next((1/(i+1) for i,d in enumerate(ids) if d in gold),0)
    n=len(queries)
    times=sorted(durations)
    p95=times[max(0,math.ceil(.95*n)-1)]
    return {"queries":n,"hit_rate_at_k":round(hits/n,3),"recall_at_k":round(recall/n,3),"mrr":round(rr/n,3),"p95_ms":round(p95,3)}

def apply_event(state,event):
    """Last-revision-wins per document; duplicate/out-of-order events are ignored."""
    key=event["id"]; rev=event["revision"]
    old=state.get(key)
    if old is not None and rev <= old["revision"]: return False
    if event["operation"]=="delete":
        state[key]={"id":key,"revision":rev,"deleted":True}
    elif event["operation"]=="upsert":
        state[key]={**event["document"],"id":key,"revision":rev,"deleted":False}
    else: raise ValueError("operation")
    return True

if __name__=="__main__":
    documents=load("corpus.json"); queries=load("golden.json")
    for mode in ("lexical","dense","hybrid"):
        print(mode,json.dumps(metrics(queries,documents,mode),sort_keys=True))
    print("Example citations:",context("RAG citations",documents))
    state={}
    for event in [
        {"id":"d7","revision":1,"operation":"upsert","document":{"scope":"public","source":"docs/new","text":"New indexed document"}},
        {"id":"d7","revision":1,"operation":"upsert","document":{"scope":"public","source":"docs/new","text":"Duplicated event"}},
        {"id":"d7","revision":2,"operation":"delete"},
        {"id":"d7","revision":1,"operation":"upsert","document":{"scope":"public","source":"docs/new","text":"Late event"}}
    ]: print("event changed:",apply_event(state,event))
    print("state:",state)
