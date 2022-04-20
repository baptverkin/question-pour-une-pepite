import Link from "next/link";
import Image from "next/link"
import styles from "../styles/Home.module.css";
import Head from "next/head";
import { ReactNode } from "react";
import { useUser } from "@auth0/nextjs-auth0";

export const Layout: React.FC<{ children: any }> = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { user } = useUser();
  return (
    <div className="Background">
      <Head>
        <title>Question pour une pépite 🌟</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <nav >
        <header className="p-3 bg-primary  text-white"  >
          <div className="container">
            <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
              <Link href="/">
                <a className="d-flex align-items-center mb-2 mb-lg-0 text-white text-decoration-none">
                  Question pour une pépite 🌟
                </a>
              </Link>
              <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0"></ul>
              <div className="text-end">
                <Link href="/profile">
                  <img className="img-samuel"src="https://i.ibb.co/WKqqS6S/image-9-removebg-preview.png" alt="Samuel"  width="40" height="50"/>
                </Link>
                {user ? (
                  <Link href="/api/auth/logout" passHref={true}>
                    <button type="button" className="btn btn-warning">
                      <a>Logout</a>
                    </button>
                  </Link>
                ) : (
                  <Link href="/api/auth/login" passHref={true}>
                    <button type="button" className="btn btn-warning">
                      <a>Login</a>
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </header>
      </nav>
      {children}

      <footer className={styles.footer}>
        <p>Fait par des pépites pour des pépites</p>
      </footer>
    </div>
  );
};
