import { useEffect, useRef, useState } from "react";

function getInstallEnvironment() {
  if (typeof window === "undefined") {
    return {
      isInstalled: false,
      needsManualInstall: false,
    };
  }

  const supportsMatchMedia = typeof window.matchMedia === "function";
  const isStandalone =
    (supportsMatchMedia &&
      window.matchMedia("(display-mode: standalone)").matches) ||
    window.navigator.standalone === true;
  const userAgent = window.navigator.userAgent || "";
  const isIosDevice = /iphone|ipad|ipod/i.test(userAgent);

  return {
    isInstalled: Boolean(isStandalone),
    needsManualInstall: isIosDevice && !isStandalone,
  };
}

export default function usePwaInstall() {
  const deferredPromptRef = useRef(null);
  const [{ canInstall, isInstalled, needsManualInstall }, setInstallState] =
    useState(() => {
      const environment = getInstallEnvironment();

      return {
        canInstall: false,
        isInstalled: environment.isInstalled,
        needsManualInstall: environment.needsManualInstall,
      };
    });

  useEffect(() => {
    const syncInstallState = () => {
      const environment = getInstallEnvironment();

      setInstallState((current) => ({
        canInstall: environment.isInstalled ? false : current.canInstall,
        isInstalled: environment.isInstalled,
        needsManualInstall: environment.isInstalled
          ? false
          : environment.needsManualInstall,
      }));
    };

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      deferredPromptRef.current = event;

      setInstallState({
        canInstall: true,
        isInstalled: false,
        needsManualInstall: false,
      });
    };

    const handleAppInstalled = () => {
      deferredPromptRef.current = null;

      setInstallState({
        canInstall: false,
        isInstalled: true,
        needsManualInstall: false,
      });
    };

    syncInstallState();

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    const mediaQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(display-mode: standalone)")
        : null;
    const handleDisplayModeChange = (event) => {
      if (event.matches) {
        handleAppInstalled();
      }
    };

    if (mediaQuery?.addEventListener) {
      mediaQuery.addEventListener("change", handleDisplayModeChange);
    } else if (mediaQuery?.addListener) {
      mediaQuery.addListener(handleDisplayModeChange);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);

      if (mediaQuery?.removeEventListener) {
        mediaQuery.removeEventListener("change", handleDisplayModeChange);
      } else if (mediaQuery?.removeListener) {
        mediaQuery.removeListener(handleDisplayModeChange);
      }
    };
  }, []);

  const promptInstall = async () => {
    if (deferredPromptRef.current) {
      const promptEvent = deferredPromptRef.current;
      deferredPromptRef.current = null;

      await promptEvent.prompt();
      const choiceResult = await promptEvent.userChoice;

      if (choiceResult?.outcome === "accepted") {
        setInstallState((current) => ({
          ...current,
          canInstall: false,
        }));

        return "accepted";
      }

      setInstallState((current) => ({
        ...current,
        canInstall: true,
      }));

      return "dismissed";
    }

    if (isInstalled) {
      return "installed";
    }

    if (needsManualInstall) {
      return "manual";
    }

    return "unsupported";
  };

  return {
    canInstall,
    isInstalled,
    needsManualInstall,
    promptInstall,
  };
}
