import Link from "next/link";

export default function ScannerPage() {
  return (
    <main>
      <h1>Scanner une bouteille</h1>

      <p>Que souhaitez-vous faire ?</p>

      <Link href="/scanner/ajouter">
        Ajouter une bouteille
      </Link>

      <br />

      <Link href="/scanner/retirer">
        Retirer une bouteille
      </Link>

      <br />

      <Link href="/">
        Retour à laccueil
      </Link>
    </main>
  );
}