"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface UserInfo {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
}

export default function CuentaPage() {
  const { data: session, update: updateSession } = useSession();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameMsg, setNameMsg] = useState("");

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState("");

  useEffect(() => {
    fetch("/api/user")
      .then(r => r.json())
      .then(data => {
        setUser(data);
        setName(data.name ?? "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSaveName = async () => {
    setSavingName(true);
    setNameMsg("");
    const res = await fetch("/api/user", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (res.ok) {
      setUser(data);
      setNameMsg("✓ Nombre actualizado");
      await updateSession({ name: data.name });
    } else {
      setNameMsg(data.error ?? "Error al guardar");
    }
    setSavingName(false);
  };

  const handleChangePwd = async () => {
    if (!newPwd || !currentPwd) return;
    if (newPwd !== confirmPwd) { setPwdMsg("Las contraseñas no coinciden"); return; }
    if (newPwd.length < 6) { setPwdMsg("Mínimo 6 caracteres"); return; }
    setSavingPwd(true);
    setPwdMsg("");
    const res = await fetch("/api/user", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
    });
    const data = await res.json();
    if (res.ok) {
      setPwdMsg("✓ Contraseña actualizada");
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    } else {
      setPwdMsg(data.error ?? "Error al cambiar contraseña");
    }
    setSavingPwd(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{
          fontFamily: "'Playfair Display', serif",
          background: "linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>Mi Cuenta</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Configuración de tu perfil</p>
      </div>

      {/* Avatar + info */}
      <div className="flex items-center gap-4" style={{ padding: "16px 20px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16 }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
          style={{ background: "rgba(201,168,76,0.15)", color: "var(--gold)", border: "1px solid rgba(201,168,76,0.3)" }}>
          {((user?.name || user?.email || "?")[0]).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold" style={{ color: "var(--foreground)" }}>{user?.name || "Sin nombre"}</p>
          <p className="text-sm" style={{ color: "var(--muted)" }}>{user?.email}</p>
          {user?.createdAt && (
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
              Miembro desde {new Date(user.createdAt).toLocaleDateString("es-MX", { month: "long", year: "numeric" })}
            </p>
          )}
        </div>
      </div>

      {/* Change name */}
      <Card>
        <CardHeader><CardTitle>Cambiar nombre</CardTitle></CardHeader>
        <div className="space-y-3">
          <Input label="Nombre" placeholder="Tu nombre" value={name} onChange={e => setName(e.target.value)} />
          {nameMsg && (
            <p className="text-xs" style={{ color: nameMsg.startsWith("✓") ? "var(--success)" : "var(--error)" }}>
              {nameMsg}
            </p>
          )}
          <Button onClick={handleSaveName} disabled={savingName || name === (user?.name ?? "")} size="sm">
            {savingName ? "Guardando..." : "Guardar nombre"}
          </Button>
        </div>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader><CardTitle>Cambiar contraseña</CardTitle></CardHeader>
        <div className="space-y-3">
          <Input label="Contraseña actual" type="password" placeholder="••••••••" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} />
          <Input label="Nueva contraseña" type="password" placeholder="••••••••" value={newPwd} onChange={e => setNewPwd(e.target.value)} />
          <Input label="Confirmar nueva contraseña" type="password" placeholder="••••••••" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} />
          {pwdMsg && (
            <p className="text-xs" style={{ color: pwdMsg.startsWith("✓") ? "var(--success)" : "var(--error)" }}>
              {pwdMsg}
            </p>
          )}
          <Button onClick={handleChangePwd} disabled={savingPwd || !currentPwd || !newPwd || !confirmPwd} size="sm">
            {savingPwd ? "Guardando..." : "Cambiar contraseña"}
          </Button>
        </div>
      </Card>

      {/* Spotify status */}
      <Card>
        <CardHeader><CardTitle>Conexiones</CardTitle></CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "#1DB954" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Spotify</p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                {session ? "Conectado" : "No conectado"}
              </p>
            </div>
          </div>
          <a href="/api/spotify/auth" className="text-xs px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
            style={{ border: "1px solid var(--border)", color: "var(--muted)" }}>
            Reconectar
          </a>
        </div>
      </Card>

      {/* Sign out */}
      <button onClick={() => signOut({ callbackUrl: "/login" })}
        className="w-full py-3 rounded-xl text-sm font-medium transition-all"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)" }}>
        Cerrar sesión →
      </button>
    </div>
  );
}
