"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import styles from "./page.module.css";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] =
    useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(
        "/api/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        },
      );

      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error ||
            "로그인에 실패했습니다.",
        );
      }

      router.replace("/admin");
      router.refresh();
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "로그인에 실패했습니다.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.brand}>
          <div className={styles.mark}>DS</div>

          <div>
            <strong>DEFENSE SEMI</strong>
            <span>B2B MARKET</span>
          </div>
        </div>

        <div className={styles.heading}>
          <p>ADMIN CMS</p>
          <h1>관리자 로그인</h1>
          <span>
            Product, Supplier, Knowledge 및
            Verification 데이터를 관리합니다.
          </span>
        </div>

        <form
          className={styles.form}
          onSubmit={handleSubmit}
        >
          <label>
            <span>ADMIN EMAIL</span>
            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              autoComplete="username"
              placeholder="admin@example.com"
              required
            />
          </label>

          <label>
            <span>PASSWORD</span>
            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />
          </label>

          {error ? (
            <div
              className={styles.error}
              role="alert"
            >
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? "확인 중..."
              : "Admin CMS 접속"}
          </button>
        </form>

        <div className={styles.security}>
          <strong>Protected Admin Access</strong>
          <span>
            관리자 세션은 HttpOnly Cookie로
            보호됩니다.
          </span>
        </div>
      </section>
    </main>
  );
}
