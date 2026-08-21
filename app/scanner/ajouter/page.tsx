import Link from "next/link";

export default function AjouterPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <h1>Ajouter une bouteille</h1>

        <p>Choisissez la méthode d’identification.</p>

        <div
          style={{
            marginTop: "40px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <Link
            href="/scanner/ajouter/code-barres"
            style={{
              display: "block",
              padding: "18px",
              border: "1px solid #ccc",
              borderRadius: "10px",
              textDecoration: "none",
              fontSize: "18px",
            }}
          >
            Scanner un code-barres
          </Link>

          <Link
            href="/scanner/ajouter/etiquette"
            style={{
              display: "block",
              padding: "18px",
              border: "1px solid #ccc",
              borderRadius: "10px",
              textDecoration: "none",
              fontSize: "18px",
            }}
          >
            Scanner une étiquette
          </Link>
        </div>

        <div
          style={{
            marginTop: "40px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <Link href="/scanner">
            Retour au scanner
          </Link>

          <Link href="/">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </main>
  );
}