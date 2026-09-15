"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/UI";
import type { KnowledgeArticle } from "@/data/mock";
import { KnowledgeVisual } from "@/components/PrototypeProductVisual";

type Props = { articles: KnowledgeArticle[] };

export default function KnowledgeCatalog({ articles }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("전체");
  const [process, setProcess] = useState("전체");

  const categories = useMemo(() => ["전체", ...Array.from(new Set(articles.map((item) => item.category)))], [articles]);
  const processes = useMemo(() => ["전체", ...Array.from(new Set(articles.map((item) => item.relatedProcess)))], [articles]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((article) => {
      const searchable = [article.title, article.summary, article.category, article.relatedProcess, ...article.tags].join(" ").toLowerCase();
      return (!q || searchable.includes(q)) &&
        (category === "전체" || article.category === category) &&
        (process === "전체" || article.relatedProcess === process);
    });
  }, [articles, query, category, process]);

  return (
    <>
      <section className="card knowledgeFilter">
        <label className="catalogField grow">
          <span>Knowledge 검색</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="예: CFD, HBM, Focus Ring, RFQ" />
        </label>
        <label className="catalogField">
          <span>카테고리</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className="catalogField">
          <span>연결 공정 / 영역</span>
          <select value={process} onChange={(event) => setProcess(event.target.value)}>
            {processes.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <div className="knowledgeResultCount"><strong>{filtered.length}</strong><span>개의 콘텐츠</span></div>
      </section>

      <div className="knowledgeListGrid">
        {filtered.map((article) => (
          <Link className="card knowledgeListCard" href={`/knowledge/${article.slug}`} key={article.slug}>
            <KnowledgeVisual article={article} className="knowledgeCover" />
            <div className="knowledgeCardMeta"><Badge>{article.category}</Badge><span>{article.publishedAt} · {article.readingTime}</span></div>
            <h2>{article.title}</h2>
            <p>{article.summary}</p>
            <div className="knowledgeTags">{article.tags.slice(0, 3).map((tag) => <span key={tag}>#{tag}</span>)}</div>
            <strong className="cardLink">Knowledge 상세 보기 →</strong>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && <div className="card emptyState">조건에 맞는 Knowledge 콘텐츠가 없습니다.</div>}
    </>
  );
}
