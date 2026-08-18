import Link from "next/link";

export default function RetirerPage() {
  return (
    <main>
      <h1>Retirer une bouteille</h1>

      <p>
        Ici, nous scannerons une bouteille pour la retirer de la cave.
      </p>

      <Link href="/scanner">
        Retour au scanner
      </Link>
    </main>
  );
}