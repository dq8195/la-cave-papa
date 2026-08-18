"use client";

import Link from "next/link";
import { useRef, useState } from "react";

export default function AjouterPage() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [erreur, setErreur] = useState("");
  const [cameraActive, setCameraActive] = useState(false);

  async function ouvrirCamera() {
    setErreur("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (error) {
      console.error(error);
      setErreur("Impossible d'ouvrir la caméra.");
    }
  }

  function fermerCamera() {
    const video = videoRef.current;

    if (video?.srcObject) {
      const stream = video.srcObject as MediaStream;

      stream.getTracks().forEach((track) => {
        track.stop();
      });

      video.srcObject = null;
    }

    setCameraActive(false);
  }

  return (
    <main>
      <h1>Test caméra</h1>

      <button onClick={ouvrirCamera}>
        Ouvrir la caméra
      </button>

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
      </div>

      {cameraActive && (
        <button onClick={fermerCamera}>
          Fermer la caméra
        </button>
      )}

      {erreur && <p>{erreur}</p>}

      <br />

      <Link href="/">
        Retour à l'accueil
      </Link>
    </main>
  );
}