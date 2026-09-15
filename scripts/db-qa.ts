import { prisma } from "../lib/db";
import { runDbQa } from "../lib/dbQa";

function line(char = "-") {
  console.log(char.repeat(72));
}

async function main() {
  console.log("\nDEFENSE SEMI B2B MARKET — Stage 11 DB QA");
  line("=");

  const result = await runDbQa();

  console.log("PostgreSQL connection : OK");
  console.log(`Checked at            : ${result.checkedAt}`);
  line();
  console.log(`Products              : ${result.counts.products} (Published ${result.counts.publishedProducts})`);
  console.log(`Suppliers             : ${result.counts.suppliers} (Published ${result.counts.publishedSuppliers})`);
  console.log(`Knowledge             : ${result.counts.knowledge} (Published ${result.counts.publishedKnowledge})`);
  console.log(`RFQ / Items / Matches : ${result.counts.rfqs} / ${result.counts.rfqItems} / ${result.counts.rfqMatches}`);
  line();

  if (!result.issues.length) {
    console.log("PASS: 핵심 DB 관계에서 경고 또는 오류를 발견하지 못했습니다.");
  } else {
    for (const issue of result.issues) {
      const mark = issue.level === "error" ? "ERROR" : "WARN";
      console.log(`${mark} [${issue.code}] ${issue.message}`);
      for (const item of issue.items ?? []) console.log(`  - ${item}`);
    }
  }

  line("=");
  console.log(result.ok ? "RESULT: PASS" : "RESULT: FAIL");
  console.log("경고(WARN)는 관계 보완 권장 사항이며, ERROR가 있을 때만 FAIL 처리됩니다.\n");

  if (!result.ok) process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error("DB QA 실행 실패:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
