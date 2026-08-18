"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  BrowserMultiFormatReader,
  IScannerControls,
} from "@zxing/browser";

export default function AjouterPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

  const [codeBarres, setCodeBarres] = useState("");
  const [erreur, setErreur] = useState("");
  const [scannerActif, setScannerActif] = useState(false);

  async function ouvrirScanner() {
    setErreur("");
    setCodeBarres("");
    setScannerActif(true);

    try {
      const lecteur = new BrowserMultiFormatReader();

      const controls = await lecteur.decodeFromConstraints(
        {
          video: {
            facingMode: { ideal: "environment" },
          },
          audio: false,
        },
        videoRef.current!,
        (result, error) => {
          if (result) {
            const code = result.getText();

            setCodeBarres(code);

            controlsRef.current?.stop();
            controlsRef.current = null;

            setScannerActif(false);
          }

          if (error) {
            // Les erreurs "aucun code trouvé dans cette image"
            // sont normales pendant le scan continu.
            console.log(error);
          }
        }
      );

      controlsRef.current = controls;
    } catch (error) {
      console.error(error);
      setErreur("Impossible de démarrer le scanner.");
      setScannerActif(false);
    }
  }

  function fermerScanner() {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setScannerActif(false);
  }

  return (
    <main>
      <h1>Ajouter une bouteille</h1>

      <p>Placez le code-barres de la bouteille devant la caméra.</p>

      {!scannerActif && (
        <button onClick={ouvrirScanner}>
          Ouvrir le scanner
        </button>
      )}

      {scannerActif && (
        <div>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{
              display: "block",
              width: "100%",
              maxWidth: "500px",
              minHeight: "300px",
              marginTop: "20px",
              backgroundColor: "black",
            }}
          />

          <br />

          <button onClick={fermerScanner}>
            Fermer le scanner
          </button>
        </div>
      )}

      {codeBarres && (
        <div>
          <h2>Code-barres détecté</h2>

          <p>{codeBarres}</p>
        </div>
      )}

      {erreur && (
        <p>{erreur}</p>
      )}

      <br />

      <Link href="/scanner">
        Retour au scanner
      </Link>

      <br />

      <Link href="/">
        Retour à l'accueil
      </Link>
    </main>
  );
}