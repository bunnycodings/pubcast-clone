"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings, LogOut, DollarSign, Tag } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Settings state
  const [services, setServices] = useState<any>(null);
  const [promoText, setPromoText] = useState("");
  const [promoSubtext, setPromoSubtext] = useState("");
  const [saving, setSaving] = useState(false);

  // Check authentication
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/admin/check", {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setAuthenticated(true);
          setShowLogin(false);
          loadSettings();
        } else {
          setAuthenticated(false);
          setShowLogin(true);
        }
      } else {
        setAuthenticated(false);
        setShowLogin(true);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setAuthenticated(false);
      setShowLogin(true);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings", {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setServices(data.settings.services || null);
          setPromoText(data.settings.promo_text || "");
          setPromoSubtext(data.settings.promo_subtext || "");
        }
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAuthenticated(true);
        setShowLogin(false);
        loadSettings();
      } else {
        setLoginError(data.error || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      }
    } catch (error) {
      setLoginError("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: 'include',
      });
      setAuthenticated(false);
      setShowLogin(true);
      setServices(null);
      setPromoText("");
      setPromoSubtext("");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          services,
          promo_text: promoText,
          promo_subtext: promoSubtext,
        }),
      });

      if (response.ok) {
        alert("บันทึกการตั้งค่าสำเร็จ!");
      } else {
        alert("เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSaving(false);
    }
  };

  const updateServicePrice = (serviceId: string, variantId: string, price: number) => {
    if (!services) return;
    const updatedServices = { ...services };
    if (updatedServices[serviceId] && updatedServices[serviceId].variants) {
      const variant = updatedServices[serviceId].variants.find((v: any) => v.id === variantId);
      if (variant) {
        variant.price = price;
        // Update minPrice
        const prices = updatedServices[serviceId].variants.map((v: any) => v.price);
        updatedServices[serviceId].minPrice = Math.min(...prices);
      }
    }
    setServices(updatedServices);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white font-sans flex items-center justify-center">
        <p className="text-gray-400">กำลังโหลด...</p>
      </main>
    );
  }

  if (showLogin) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white font-sans flex items-center justify-center">
        <div className="w-full max-w-md p-8">
          <div className="bg-[#1a1a2e] rounded-2xl p-8 border border-purple-500/30">
            <h1 className="text-2xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              แผงควบคุมแอดมิน
            </h1>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">ชื่อผู้ใช้</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">รหัสผ่าน</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              {loginError && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-sm text-red-300">
                  {loginError}
                </div>
              )}
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-4 rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
              >
                {loginLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              แผงควบคุมแอดมิน
            </h1>
            <p className="text-gray-400 text-sm mt-1">จัดการราคาและข้อความโปรโมชั่น</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 font-semibold py-2 px-4 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
            ออกจากระบบ
          </button>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Promo Text Section */}
          <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <Tag className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold">ข้อความโปรโมชั่น</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">หัวข้อโปรโมชั่น</label>
                <input
                  type="text"
                  value={promoText}
                  onChange={(e) => setPromoText(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="ส่งรูปขึ้นจอ ฟรี!"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">ข้อความย่อย</label>
                <input
                  type="text"
                  value={promoSubtext}
                  onChange={(e) => setPromoSubtext(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="18:00 - 22:00 น. เท่านั้น"
                />
              </div>
            </div>
          </div>

          {/* Services Pricing Section */}
          {services && (
            <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <DollarSign className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-bold">จัดการราคาบริการ</h2>
              </div>
              <div className="space-y-6">
                {Object.values(services).map((service: any) => (
                  <div key={service.id} className="border-b border-white/10 pb-6 last:border-0 last:pb-0">
                    <h3 className="text-lg font-semibold mb-4">{service.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {service.variants.map((variant: any) => (
                        <div key={variant.id} className="bg-[#0a0a0a] rounded-xl p-4 border border-white/5">
                          <p className="text-sm text-gray-400 mb-2">{variant.name}</p>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={variant.price}
                              onChange={(e) => updateServicePrice(service.id, variant.id, parseInt(e.target.value) || 0)}
                              className="flex-1 bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              min="0"
                            />
                            <span className="text-gray-400">บาท</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 px-6 rounded-xl hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Settings className="w-5 h-5" />
            {saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
          </button>
        </div>
      </div>
    </main>
  );
}

