"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  BrowserMultiFormatReader,
  IScannerControls,
} from "@zxing/browser";

export default function RetirerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [scannerActif, setScannerActif] = useState(false);
  const [codeBarres, setCodeBarres] = useState("");
  const [erreur, setErreur] = useState("");
  const [quantite, setQuantite] = useState(1);

  async function ouvrirScanner() {
    setErreur("");
    setCodeBarres("");
    setQuantite(1);
    setScannerActif(true);

    // On laisse React créer l'élément <video>
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "La caméra n'est pas disponible sur ce navigateur."
        );
      }

      const video = videoRef.current;

      if (!video) {
        throw new Error("La zone vidéo n'est pas prête.");
      }

      // 1. Ouverture de la caméra
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: {
            ideal: "environment",
          },
          width: {
            ideal: 1280,
          },
          height: {
            ideal: 720,
          },
        },
        audio: false,
      });

      streamRef.current = stream;

      // 2. Affichage du flux caméra
      video.srcObject = stream;

      await video.play();

      // 3. Analyse du flux avec ZXing
      const lecteur = new BrowserMultiFormatReader();

      const controls = await lecteur.decodeFromStream(
        stream,
        video,
        (result) => {
          if (result) {
            const code = result.getText();

            console.log("Code détecté :", code);

            setCodeBarres(code);

            fermerScanner();
          }
        }
      );

      controlsRef.current = controls;
    } catch (error) {
      console.error("Erreur caméra/scanner :", error);

      if (error instanceof Error) {
        setErreur(error.message);
      } else {
        setErreur("Impossible de démarrer le scanner.");
      }

      fermerScanner();
    }
  }

  function fermerScanner() {
    controlsRef.current?.stop();
    controlsRef.current = null;

    streamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setScannerActif(false);
  }

  function diminuerQuantite() {
    if (quantite > 1) {
      setQuantite(quantite - 1);
    }
  }

  function augmenterQuantite() {
    setQuantite(quantite + 1);
  }

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
        }}
      >
        <h1
          style={{
            textAlign: "center",
          }}
        >
          Retirer une bouteille
        </h1>

        <p
          style={{
            textAlign: "center",
          }}
        >
          Scannez le code-barres de la bouteille à retirer.
        </p>

        {!scannerActif && !codeBarres && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "24px",
            }}
          >
            <button
              type="button"
              onClick={ouvrirScanner}
              style={{
                padding: "14px 24px",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              Ouvrir la caméra
            </button>
          </div>
        )}

        {scannerActif && (
          <div
            style={{
              marginTop: "24px",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                backgroundColor: "black",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{
                  display: "block",
                  width: "100%",
                  minHeight: "300px",
                  objectFit: "cover",
                  backgroundColor: "black",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  left: "10%",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "80%",
                  height: "110px",
                  border: "3px solid white",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                  pointerEvents: "none",
                }}
              />
            </div>

            <p
              style={{
                textAlign: "center",
                marginTop: "12px",
              }}
            >
              Placez le code-barres dans le cadre blanc.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "16px",
              }}
            >
              <button
                type="button"
                onClick={fermerScanner}
                style={{
                  padding: "12px 20px",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                Fermer la caméra
              </button>
            </div>
          </div>
        )}

        {codeBarres && (
          <div
            style={{
              marginTop: "30px",
              textAlign: "center",
            }}
          >
            <h2>Code-barres détecté</h2>

            <p
              style={{
                fontSize: "20px",
                fontWeight: "bold",
              }}
            >
              {codeBarres}
            </p>

            <h3
              style={{
                marginTop: "30px",
              }}
            >
              Nombre de bouteilles à retirer
            </h3>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "25px",
                marginTop: "20px",
              }}
            >
              <button
                type="button"
                onClick={diminuerQuantite}
                disabled={quantite === 1}
                style={{
                  width: "55px",
                  height: "55px",
                  fontSize: "28px",
                  cursor:
                    quantite === 1
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                −
              </button>

              <span
                style={{
                  fontSize: "36px",
                  fontWeight: "bold",
                  minWidth: "50px",
                }}
              >
                {quantite}
              </span>

              <button
                type="button"
                onClick={augmenterQuantite}
                style={{
                  width: "55px",
                  height: "55px",
                  fontSize: "28px",
                  cursor: "pointer",
                }}
              >
                +
              </button>
            </div>

            <button
              type="button"
              style={{
                marginTop: "30px",
                padding: "14px 24px",
                fontSize: "17px",
                cursor: "pointer",
              }}
            >
              Retirer {quantite}{" "}
              {quantite === 1 ? "bouteille" : "bouteilles"}
            </button>

            <br />

            <button
              type="button"
              onClick={ouvrirScanner}
              style={{
                marginTop: "20px",
                padding: "10px 18px",
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              Scanner une autre bouteille
            </button>
          </div>
        )}

        {erreur && (
          <div
            style={{
              marginTop: "24px",
              textAlign: "center",
            }}
          >
            <h2>Erreur</h2>
            <p>{erreur}</p>
          </div>
        )}

        <div
          style={{
            marginTop: "40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
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