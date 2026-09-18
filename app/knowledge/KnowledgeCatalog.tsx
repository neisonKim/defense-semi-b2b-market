"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/UI";
import type { KnowledgeArticle } from "@/data/mock";
import { KnowledgeVisual } from "@/components/PrototypeProductVisual";

type Props = {
  articles: KnowledgeArticle[];
};

const ALL = "전체";

function getReadingMinutes(value: string) {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function getReadingBand(value: string) {
  const minutes = getReadingMinutes(value);

  if (!minutes) return "기타";
  if (minutes <= 5) return "5분 이하";
  if (minutes <= 10) return "6–10분";
  return "11분 이상";
}

export default function KnowledgeCatalog({
  articles,
}: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL);
  const [process, setProcess] = useState(ALL);
  const [readingTime, setReadingTime] =
    useState(ALL);
  const [mobileFiltersOpen, setMobileFiltersOpen] =
    useState(false);

  const categories = useMemo(
    () => [
      ALL,
      ...Array.from(
        new Set(
          articles
            .map((item) => item.category)
            .filter(Boolean),
        ),
      ),
    ],
    [articles],
  );

  const processes = useMemo(
    () => [
      ALL,
      ...Array.from(
        new Set(
          articles
            .map((item) => item.relatedProcess)
            .filter(Boolean),
        ),
      ),
    ],
    [articles],
  );

  const readingBands = useMemo(
    () => [
      ALL,
      ...Array.from(
        new Set(
          articles
            .map((item) =>
              getReadingBand(
                item.readingTime,
              ),
            )
            .filter(Boolean),
        ),
      ),
    ],
    [articles],
  );

  const filtered = useMemo(() => {
    const q = query
      .trim()
      .toLowerCase();

    return articles.filter(
      (article) => {
        const searchable = [
          article.title,
          article.summary,
          article.category,
          article.relatedProcess,
          article.readingTime,
          ...article.tags,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const queryMatch =
          !q ||
          searchable.includes(q);

        const categoryMatch =
          category === ALL ||
          article.category === category;

        const processMatch =
          process === ALL ||
          article.relatedProcess ===
            process;

        const readingMatch =
          readingTime === ALL ||
          getReadingBand(
            article.readingTime,
          ) === readingTime;

        return (
          queryMatch &&
          categoryMatch &&
          processMatch &&
          readingMatch
        );
      },
    );
  }, [
    articles,
    query,
    category,
    process,
    readingTime,
  ]);

  const hasActiveFilters =
    Boolean(query.trim()) ||
    category !== ALL ||
    process !== ALL ||
    readingTime !== ALL;

  const activeFilters =
    useMemo(() => {
      const filters: string[] = [];

      if (query.trim()) {
        filters.push(
          `검색: ${query.trim()}`,
        );
      }

      if (category !== ALL) {
        filters.push(
          `카테고리: ${category}`,
        );
      }

      if (process !== ALL) {
        filters.push(
          `공정: ${process}`,
        );
      }

      if (readingTime !== ALL) {
        filters.push(
          `읽기 시간: ${readingTime}`,
        );
      }

      return filters;
    }, [
      query,
      category,
      process,
      readingTime,
    ]);

  const reset = () => {
    setQuery("");
    setCategory(ALL);
    setProcess(ALL);
    setReadingTime(ALL);
    setMobileFiltersOpen(false);
  };

  return (
    <>
      <div className="catalogResultBar knowledgeResultBar">
        <div className="catalogResultCopy">
          <span>
            KNOWLEDGE DISCOVERY
          </span>

          <div>
            <h2>
              기술 Knowledge 탐색
            </h2>

            <strong>
              {filtered.length}
            </strong>
          </div>

          <p>
            반도체 공정·소재·장비·열관리와 관련된 기술 콘텐츠를
            주제와 공정 기준으로 탐색할 수 있습니다.
          </p>
        </div>

        <button
          type="button"
          className="catalogMobileFilterToggle"
          onClick={() =>
            setMobileFiltersOpen(
              (current) => !current,
            )
          }
          aria-expanded={
            mobileFiltersOpen
          }
        >
          {mobileFiltersOpen
            ? "필터 닫기"
            : "검색 / 필터"}

          <span>
            {activeFilters.length > 0
              ? activeFilters.length
              : ""}
          </span>
        </button>
      </div>

      <section className="card liveCatalogFilter knowledgeCatalogFilter">
        <div className="catalogFilterHead">
          <div>
            <span>
              SEARCH & FILTER
            </span>

            <strong>
              기술자료 검색 및 조건 설정
            </strong>
          </div>

          {hasActiveFilters ? (
            <button
              type="button"
              className="catalogResetText"
              onClick={reset}
            >
              전체 초기화
            </button>
          ) : null}
        </div>

        <div
          className={`catalogFilterBody ${
            mobileFiltersOpen
              ? "open"
              : ""
          }`}
        >
          <div className="knowledgeSearchGrid">
            <label className="catalogField grow">
              <span>
                Knowledge 검색
              </span>

              <input
                value={query}
                onChange={(event) =>
                  setQuery(
                    event.target.value,
                  )
                }
                placeholder="예: CFD, HBM, Focus Ring, Thermal, RFQ"
              />
            </label>

            <label className="catalogField">
              <span>
                Category
              </span>

              <select
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target.value,
                  )
                }
              >
                {categories.map(
                  (item) => (
                    <option key={item}>
                      {item}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="catalogField">
              <span>
                Related Process
              </span>

              <select
                value={process}
                onChange={(event) =>
                  setProcess(
                    event.target.value,
                  )
                }
              >
                {processes.map(
                  (item) => (
                    <option key={item}>
                      {item}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="catalogField">
              <span>
                Reading Time
              </span>

              <select
                value={readingTime}
                onChange={(event) =>
                  setReadingTime(
                    event.target.value,
                  )
                }
              >
                {readingBands.map(
                  (item) => (
                    <option key={item}>
                      {item}
                    </option>
                  ),
                )}
              </select>
            </label>
          </div>

          <div className="catalogFilterFooter">
            <div className="knowledgeFilterHint">
              <span>
                기술 콘텐츠를 공정과 주제로 좁혀보세요.
              </span>
            </div>

            <div className="filterResultActions">
              <strong>
                {filtered.length}개 콘텐츠
              </strong>

              <button
                className="btn"
                type="button"
                onClick={reset}
                disabled={
                  !hasActiveFilters
                }
              >
                필터 초기화
              </button>
            </div>
          </div>
        </div>
      </section>

      {activeFilters.length > 0 ? (
        <div className="catalogActiveFilters knowledgeActiveFilters">
          <span>
            현재 조건
          </span>

          {activeFilters.map(
            (filter) => (
              <strong key={filter}>
                {filter}
              </strong>
            ),
          )}
        </div>
      ) : null}

      {filtered.length > 0 ? (
        <div className="knowledgeListGrid knowledgeDiscoveryGrid">
          {filtered.map(
            (article) => (
              <Link
                className="card knowledgeListCard knowledgeDiscoveryCard"
                href={`/knowledge/${article.slug}`}
                key={article.slug}
              >
                <KnowledgeVisual
                  article={article}
                  className="knowledgeCover"
                />

                <div className="knowledgeDiscoveryTopline">
                  <Badge>
                    {article.category}
                  </Badge>

                  <span>
                    {article.readingTime}
                  </span>
                </div>

                <h2>
                  {article.title}
                </h2>

                <p>
                  {article.summary}
                </p>

                <div className="knowledgeIntelligenceGrid">
                  <div>
                    <span>
                      RELATED PROCESS
                    </span>

                    <strong>
                      {article.relatedProcess}
                    </strong>
                  </div>

                  <div>
                    <span>
                      READING TIME
                    </span>

                    <strong>
                      {article.readingTime}
                    </strong>
                  </div>

                  <div>
                    <span>
                      PUBLISHED
                    </span>

                    <strong>
                      {article.publishedAt}
                    </strong>
                  </div>
                </div>

                <div className="knowledgeTags knowledgeDiscoveryTags">
                  {article.tags
                    .slice(0, 3)
                    .map((tag) => (
                      <span key={tag}>
                        #{tag}
                      </span>
                    ))}
                </div>

                <div className="knowledgeCardBottom">
                  <div>
                    <span>
                      TECHNICAL KNOWLEDGE
                    </span>

                    <strong>
                      {article.relatedProcess}
                    </strong>
                  </div>

                  <b>
                    Knowledge 상세 →
                  </b>
                </div>
              </Link>
            ),
          )}
        </div>
      ) : (
        <div className="card emptyState catalogEmptyState">
          <span>
            0 RESULTS
          </span>

          <h3>
            조건에 맞는 Knowledge 콘텐츠가 없습니다.
          </h3>

          <p>
            검색어나 Category·공정·읽기 시간 조건을 조정하거나
            필터를 초기화해 보세요.
          </p>

          <button
            className="btn primary"
            onClick={reset}
          >
            전체 Knowledge 보기
          </button>
        </div>
      )}
    </>
  );
}
