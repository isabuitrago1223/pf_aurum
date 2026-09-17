"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleAccountsId = {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type?: "standard" | "icon";
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "large" | "medium" | "small";
      text?: "signin_with" | "signup_with" | "continue_with" | "signin";
      shape?: "rectangular" | "pill" | "circle" | "square";
      width?: number;
    },
  ) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId;
      };
    };
  }
}

type GoogleAuthButtonProps = {
  mode: "login" | "register";
  disabled?: boolean;
  onCredential: (credential: string) => void | Promise<void>;
  onError?: (message: string) => void;
};

export default function GoogleAuthButton({
  mode,
  disabled = false,
  onCredential,
  onError,
}: GoogleAuthButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);
  const initializedRef = useRef(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ?? "";

  useEffect(() => {
    onCredentialRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    if (
      !scriptLoaded ||
      !clientId ||
      !buttonRef.current ||
      !window.google
    ) {
      return;
    }

    const container = buttonRef.current;
    container.innerHTML = "";

    if (!initializedRef.current) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (!response.credential) {
            onErrorRef.current?.(
              "Google no devolvió una credencial válida.",
            );
            return;
          }

          void onCredentialRef.current(response.credential);
        },
      });

      initializedRef.current = true;
    }

    window.google.accounts.id.renderButton(container, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: mode === "register" ? "signup_with" : "signin_with",
      shape: "rectangular",
      width: 400,
    });
  }, [clientId, mode, scriptLoaded]);

  if (!clientId) {
    return (
      <button
        type="button"
        disabled
        className="flex w-full cursor-not-allowed items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-bold text-slate-400"
      >
        Google no está configurado
      </button>
    );
  }

  return (
    <>
      <Script
        id="google-identity-services"
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => setScriptLoaded(true)}
        onError={() =>
          onErrorRef.current?.(
            "No fue posible cargar el inicio de sesión con Google.",
          )
        }
      />

      <div
        className={
          disabled
            ? "pointer-events-none flex w-full justify-center opacity-60"
            : "flex w-full justify-center"
        }
        aria-disabled={disabled}
      >
        <div ref={buttonRef} className="w-full" />
      </div>
    </>
  );
}
