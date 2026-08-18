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

  const [scannerActif, setScannerActif] = useState(false);
  const [codeBarres, setCodeBarres] = useState("");
  const [erreur, setErreur] = useState("");

  async function ouvrirCamera() {
    setErreur("");
    setCodeBarres("");
    setScannerActif(true);

    try {
      const lecteur = new BrowserMultiFormatReader();

      const controls = await lecteur.decodeFromVideoDevice(
        undefined,
        videoRef.current!,
        (result) => {
          if (result) {
            const code = result.getText();

            setCodeBarres(code);
            controlsRef.current?.stop();
            controlsRef.current = null;
            setScannerActif(false);
          }
        }
      );

      controlsRef.current = controls;
    } catch (error) {
      console.error(error);
      setErreur("Impossible d'accéder à la caméra.");
      setScannerActif(false);
    }
  }

  function fermerCamera() {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setScannerActif(false);
  }

  return (
    <main>
      <h1>Ajouter une bouteille</h1>

      <p>Scannez le code-barres de la bouteille à ajouter.</p>

      {!scannerActif && (
        <button onClick={ouvrirCamera}>
          Ouvrir la caméra
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
               width: "100%",
               maxWidth: "500px",
               marginTop: "20px",
               backgroundColor: "black",
             }}
          />

          <br />

          <button onClick={fermerCamera}>
            Fermer la caméra
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
        Retour à l accueil
      </Link>
    </main>
  );
}