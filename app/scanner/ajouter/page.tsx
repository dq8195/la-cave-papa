"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  BrowserMultiFormatReader,
  IScannerControls,
} from "@zxing/browser";

import { supabase } from "@/lib/supabase/client";

export default function AjouterPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [scannerActif, setScannerActif] = useState(false);
  const [codeBarres, setCodeBarres] = useState("");
  const [quantite, setQuantite] = useState(1);

  const [erreur, setErreur] = useState("");
  const [message, setMessage] = useState("");
  const [enregistrement, setEnregistrement] = useState(false);

  async function ouvrirScanner() {
    setErreur("");
    setMessage("");
    setCodeBarres("");
    setQuantite(1);
    setScannerActif(true);

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

      video.srcObject = stream;

      await video.play();

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
      setQuantite((ancienneQuantite) => ancienneQuantite - 1);
    }
  }

  function augmenterQuantite() {
    setQuantite((ancienneQuantite) => ancienneQuantite + 1);
  }

  async function ajouterDansLaCave() {
    if (!codeBarres) {
      setErreur("Aucun code-barres n'a été détecté.");
      return;
    }

    if (quantite < 1) {
      setErreur("La quantité doit être supérieure à 0.");
      return;
    }

    setEnregistrement(true);
    setErreur("");
    setMessage("");

    try {
      console.log("Ajout Supabase");
      console.log("Code-barres :", codeBarres);
      console.log("Quantité :", quantite);

      const {
        data: bouteilleExistante,
        error: erreurLecture,
      } = await supabase
        .from("bouteilles")
        .select("id, code_barres, quantite")
        .eq("code_barres", codeBarres)
        .maybeSingle();

      if (erreurLecture) {
        console.error("Erreur SELECT :", erreurLecture);

        throw new Error(
          `Erreur de lecture Supabase : ${erreurLecture.message}`
        );
      }

      if (bouteilleExistante) {
        const quantiteActuelle =
          bouteilleExistante.quantite ?? 0;

        const nouvelleQuantite =
          quantiteActuelle + quantite;

        const {
          data: bouteilleModifiee,
          error: erreurModification,
        } = await supabase
          .from("bouteilles")
          .update({
            quantite: nouvelleQuantite,
            updated_at: new Date().toISOString(),
          })
          .eq("id", bouteilleExistante.id)
          .select("id, code_barres, quantite")
          .single();

        if (erreurModification) {
          console.error(
            "Erreur UPDATE :",
            erreurModification
          );

          throw new Error(
            `Erreur de modification Supabase : ${erreurModification.message}`
          );
        }

        console.log(
          "Bouteille modifiée :",
          bouteilleModifiee
        );

        setMessage(
          `${quantite} ${
            quantite === 1
              ? "bouteille ajoutée"
              : "bouteilles ajoutées"
          }. Stock total : ${nouvelleQuantite}.`
        );
      } else {
        const {
          data: nouvelleBouteille,
          error: erreurInsertion,
        } = await supabase
          .from("bouteilles")
          .insert({
            code_barres: codeBarres,
            quantite: quantite,
          })
          .select("id, code_barres, quantite")
          .single();

        if (erreurInsertion) {
          console.error(
            "Erreur INSERT :",
            erreurInsertion
          );

          throw new Error(
            `Erreur d'insertion Supabase : ${erreurInsertion.message}`
          );
        }

        console.log(
          "Nouvelle bouteille :",
          nouvelleBouteille
        );

        setMessage(
          `${quantite} ${
            quantite === 1
              ? "bouteille ajoutée"
              : "bouteilles ajoutées"
          } à la cave.`
        );
      }
    } catch (error) {
      console.error(
        "Erreur complète Supabase :",
        error
      );

      if (error instanceof Error) {
        setErreur(error.message);
      } else {
        setErreur(
          "Une erreur inconnue est survenue lors de l'enregistrement."
        );
      }
    } finally {
      setEnregistrement(false);
    }
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
          Ajouter une bouteille
        </h1>

        <p
          style={{
            textAlign: "center",
          }}
        >
          Scannez le code-barres de la bouteille.
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
              Nombre de bouteilles
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
              onClick={ajouterDansLaCave}
              disabled={enregistrement}
              style={{
                marginTop: "30px",
                padding: "14px 24px",
                fontSize: "17px",
                cursor: enregistrement
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {enregistrement
                ? "Enregistrement..."
                : `Ajouter ${quantite} ${
                    quantite === 1
                      ? "bouteille"
                      : "bouteilles"
                  }`}
            </button>

            {message && (
              <div
                style={{
                  marginTop: "24px",
                  padding: "15px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                }}
              >
                <strong>{message}</strong>
              </div>
            )}

            <br />

            <button
              type="button"
              onClick={ouvrirScanner}
              disabled={enregistrement}
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
              padding: "15px",
              textAlign: "center",
              border: "1px solid #ccc",
              borderRadius: "8px",
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