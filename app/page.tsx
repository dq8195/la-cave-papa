import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>La cave à papa</h1>

      <p>Bienvenue dans votre cave à vin numérique.</p>

      <Link href="/scanner">
        Scanner une bouteille
      </Link>
    </main>
  );
}