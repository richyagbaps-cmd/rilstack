"use client";

import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import * as THREE from "three";

const stats = [
  {
    title: "Total Users",
    value: "128,430",
    change: "+12.4%",
    icon: "fa-arrow-up",
  },
  {
    title: "Total Volume (USD)",
    value: "$4.2M",
    change: "+8.2%",
    icon: "fa-arrow-up",
  },
  {
    title: "Active Budgets",
    value: "54.2K",
    change: "+2.1k",
    icon: "fa-chart-line",
  },
  {
    title: "Investments AUM",
    value: "$18.9M",
    change: "+15.3%",
    icon: "fa-arrow-up",
  },
];

const transactions = [
  {
    user: "alex.walker",
    type: "Savings Deposit",
    amount: "+$1,250",
    status: "success",
    date: "2025-04-17",
  },
  {
    user: "jessica.lin",
    type: "Budget Alert",
    amount: "$320",
    status: "pending",
    date: "2025-04-17",
  },
  {
    user: "mike.ross",
    type: "Investment Buy",
    amount: "+$5,000",
    status: "success",
    date: "2025-04-16",
  },
  {
    user: "sarah.chen",
    type: "Round-up Save",
    amount: "+$47.50",
    status: "success",
    date: "2025-04-16",
  },
  {
    user: "david.kim",
    type: "Budget Overrun",
    amount: "$189",
    status: "pending",
    date: "2025-04-15",
  },
  {
    user: "emma.watson",
    type: "Dividend",
    amount: "+$234",
    status: "success",
    date: "2025-04-15",
  },
];

export default function AdminDashboard() {
  const revenueChartRef = useRef<HTMLCanvasElement>(null);
  const allocationChartRef = useRef<HTMLCanvasElement>(null);
  const threeCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Chart.js - Revenue
    if (revenueChartRef.current) {
      new Chart(revenueChartRef.current, {
        type: "line",
        data: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          datasets: [
            {
              label: "Revenue (USD)",
              data: [12400, 14800, 13200, 16700, 18900, 20400, 23100],
              borderColor: "#4FACFE",
              backgroundColor: "rgba(79, 172, 254, 0.1)",
              borderWidth: 2,
              fill: true,
              tension: 0.3,
              pointBackgroundColor: "#6bc5ff",
              pointBorderColor: "#0a0f1a",
            },
          ],
        },
        options: {
          plugins: { legend: { labels: { color: "#eef5ff" } } },
          scales: {
            y: { grid: { color: "#2a3a60" }, ticks: { color: "#bfd9ff" } },
            x: { ticks: { color: "#bfd9ff" } },
          },
        },
      });
    }
    // Chart.js - Allocation
    if (allocationChartRef.current) {
      new Chart(allocationChartRef.current, {
        type: "doughnut",
        data: {
          labels: ["Savings", "Budgeting", "Investments"],
          datasets: [
            {
              data: [42, 23, 35],
              backgroundColor: ["#4cd964", "#ffb347", "#3e8eff"],
              borderWidth: 0,
              hoverOffset: 8,
            },
          ],
        },
        options: {
          plugins: { legend: { labels: { color: "#eef5ff" } } },
        },
      });
    }
    // Three.js - Futuristic BG
    if (threeCanvasRef.current) {
      const canvas = threeCanvasRef.current;
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0f1a);
      const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
      );
      camera.position.set(0, 2, 12);
      camera.lookAt(0, 0, 0);
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: false });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      // Lights
      const ambient = new THREE.AmbientLight(0x1a2a4a);
      scene.add(ambient);
      const dirLight = new THREE.DirectionalLight(0xffffff, 1);
      dirLight.position.set(2, 5, 3);
      scene.add(dirLight);
      const backLight = new THREE.PointLight(0x3a7ec5, 0.6);
      backLight.position.set(-2, 1, -4);
      scene.add(backLight);
      // Central object
      const knotGeo = new THREE.TorusKnotGeometry(1.2, 0.25, 128, 16, 3, 4);
      const knotMat = new THREE.MeshStandardMaterial({
        color: 0x4facfe,
        emissive: 0x1a4cbc,
        emissiveIntensity: 0.5,
        metalness: 0.8,
        roughness: 0.2,
      });
      const knot = new THREE.Mesh(knotGeo, knotMat);
      scene.add(knot);
      // Particles
      const particleCount = 2000;
      const particleGeo = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 30;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 10;
      }
      particleGeo.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3),
      );
      const particleMat = new THREE.PointsMaterial({
        color: 0x6bc5ff,
        size: 0.05,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
      });
      const particles = new THREE.Points(particleGeo, particleMat);
      scene.add(particles);
      // Rotating ring
      const ringGeo = new THREE.TorusGeometry(1.8, 0.05, 64, 200);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xffb347,
        emissive: 0xaa6f20,
        emissiveIntensity: 0.3,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
      let time = 0;
      function animateBG() {
        requestAnimationFrame(animateBG);
        time += 0.008;
        knot.rotation.x = time * 0.5;
        knot.rotation.y = time * 0.8;
        ring.rotation.z = time * 0.3;
        ring.rotation.x = Math.PI / 2 + Math.sin(time) * 0.2;
        particles.rotation.y = time * 0.05;
        camera.position.x += (0 - camera.position.x) * 0.02;
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
      }
      animateBG();
      window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });
    }
  }, []);

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        fontFamily: "'Inter', sans-serif",
        background: "#0a0f1a",
        color: "#eef5ff",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={threeCanvasRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <div
        className="dashboard"
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          minHeight: "100vh",
        }}
      >
        {/* Sidebar */}
        <div
          className="sidebar"
          style={{
            width: 280,
            background: "rgba(10, 20, 35, 0.65)",
            backdropFilter: "blur(16px)",
            borderRight: "1px solid rgba(79, 172, 254, 0.3)",
            padding: "2rem 1.5rem",
          }}
        >
          <div
            className="logo"
            style={{
              fontSize: "1.8rem",
              fontWeight: 800,
              background: "linear-gradient(135deg, #fff, #6bc5ff)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              marginBottom: "2.5rem",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <i className="fas fa-cube" style={{ color: "#6bc5ff" }} />
            <span>RILSTACK</span>
          </div>
          {[
            { icon: "fa-tachometer-alt", label: "Dashboard", active: true },
            { icon: "fa-chart-line", label: "Analytics" },
            { icon: "fa-users", label: "Users" },
            { icon: "fa-wallet", label: "Transactions" },
            { icon: "fa-cog", label: "Settings" },
          ].map((item, idx) => (
            <div
              key={item.label}
              className={`nav-item${item.active ? " active" : ""}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "0.8rem 1rem",
                margin: "0.5rem 0",
                borderRadius: 16,
                color: item.active ? "#fff" : "#bfd9ff",
                background: item.active ? "rgba(79, 172, 254, 0.2)" : undefined,
                borderLeft: item.active ? "3px solid #4FACFE" : undefined,
                cursor: "pointer",
              }}
            >
              <i
                className={`fas ${item.icon}`}
                style={{ width: 24, fontSize: "1.2rem" }}
              />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        {/* Main Content */}
        <div
          className="main"
          style={{ flex: 1, padding: "2rem", overflowY: "auto" }}
        >
          <div
            className="top-bar"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2rem",
              background: "rgba(15, 25, 45, 0.5)",
              backdropFilter: "blur(8px)",
              padding: "0.8rem 1.5rem",
              borderRadius: 40,
              border: "1px solid rgba(79,172,254,0.2)",
            }}
          >
            <div className="page-title">
              <h1 style={{ fontSize: "1.6rem", fontWeight: 600 }}>
                Admin Dashboard
              </h1>
              <p style={{ fontSize: "0.8rem", color: "#8ab3ff" }}>
                Real-time insights & financial control
              </p>
            </div>
            <div
              className="admin-profile"
              style={{ display: "flex", alignItems: "center", gap: 15 }}
            >
              <i
                className="fas fa-bell"
                style={{ fontSize: "1.2rem", color: "#8ab3ff" }}
              />
              <div
                className="avatar"
                style={{
                  width: 42,
                  height: 42,
                  background: "linear-gradient(135deg, #4FACFE, #2B6EF0)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                }}
              >
                AD
              </div>
            </div>
          </div>
          {/* Stats Cards */}
          <div
            className="stats-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "1.5rem",
              marginBottom: "2rem",
            }}
          >
            {stats.map((stat, idx) => (
              <div
                key={stat.title}
                className="stat-card"
                style={{
                  background: "rgba(20, 32, 55, 0.65)",
                  backdropFilter: "blur(12px)",
                  borderRadius: 28,
                  padding: "1.2rem 1.5rem",
                  border: "1px solid rgba(79,172,254,0.3)",
                  transition: "0.2s",
                }}
              >
                <div
                  className="stat-title"
                  style={{
                    fontSize: "0.85rem",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    color: "#9bb9ff",
                  }}
                >
                  {stat.title}
                </div>
                <div
                  className="stat-value"
                  style={{
                    fontSize: "2.2rem",
                    fontWeight: 800,
                    margin: "0.5rem 0",
                  }}
                >
                  {stat.value}
                </div>
                <div
                  className="stat-change"
                  style={{ fontSize: "0.8rem", color: "#4cd964" }}
                >
                  <i className={`fas ${stat.icon}`} /> {stat.change}
                </div>
              </div>
            ))}
          </div>
          {/* Charts Row */}
          <div
            className="charts-row"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
              gap: "1.5rem",
              marginBottom: "2rem",
            }}
          >
            <div
              className="chart-card"
              style={{
                background: "rgba(15, 28, 48, 0.6)",
                backdropFilter: "blur(10px)",
                borderRadius: 28,
                padding: "1.2rem",
                border: "1px solid rgba(79,172,254,0.25)",
              }}
            >
              <h3 style={{ marginBottom: "1rem", fontWeight: 600 }}>
                <i className="fas fa-chart-line" /> Weekly Revenue
              </h3>
              <canvas
                ref={revenueChartRef}
                width={400}
                height={200}
                style={{ width: "100%", maxHeight: 250 }}
              />
            </div>
            <div
              className="chart-card"
              style={{
                background: "rgba(15, 28, 48, 0.6)",
                backdropFilter: "blur(10px)",
                borderRadius: 28,
                padding: "1.2rem",
                border: "1px solid rgba(79,172,254,0.25)",
              }}
            >
              <h3 style={{ marginBottom: "1rem", fontWeight: 600 }}>
                <i className="fas fa-chart-pie" /> Asset Allocation
              </h3>
              <canvas
                ref={allocationChartRef}
                width={400}
                height={200}
                style={{ width: "100%", maxHeight: 250 }}
              />
            </div>
          </div>
          {/* Recent Transactions Table */}
          <div
            className="transactions"
            style={{
              background: "rgba(15, 28, 48, 0.6)",
              backdropFilter: "blur(10px)",
              borderRadius: 28,
              padding: "1.2rem",
              border: "1px solid rgba(79,172,254,0.25)",
            }}
          >
            <h3 style={{ marginBottom: "1rem" }}>
              <i className="fas fa-history" /> Recent Transactions
            </h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th
                    style={{
                      color: "#9bb9ff",
                      fontWeight: 500,
                      textAlign: "left",
                      padding: "0.9rem 0.5rem",
                      borderBottom: "1px solid rgba(79,172,254,0.2)",
                    }}
                  >
                    User
                  </th>
                  <th
                    style={{
                      color: "#9bb9ff",
                      fontWeight: 500,
                      textAlign: "left",
                      padding: "0.9rem 0.5rem",
                      borderBottom: "1px solid rgba(79,172,254,0.2)",
                    }}
                  >
                    Type
                  </th>
                  <th
                    style={{
                      color: "#9bb9ff",
                      fontWeight: 500,
                      textAlign: "left",
                      padding: "0.9rem 0.5rem",
                      borderBottom: "1px solid rgba(79,172,254,0.2)",
                    }}
                  >
                    Amount
                  </th>
                  <th
                    style={{
                      color: "#9bb9ff",
                      fontWeight: 500,
                      textAlign: "left",
                      padding: "0.9rem 0.5rem",
                      borderBottom: "1px solid rgba(79,172,254,0.2)",
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      color: "#9bb9ff",
                      fontWeight: 500,
                      textAlign: "left",
                      padding: "0.9rem 0.5rem",
                      borderBottom: "1px solid rgba(79,172,254,0.2)",
                    }}
                  >
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, idx) => (
                  <tr key={idx}>
                    <td
                      style={{
                        padding: "0.9rem 0.5rem",
                        borderBottom: "1px solid rgba(79,172,254,0.2)",
                      }}
                    >
                      {tx.user}
                    </td>
                    <td
                      style={{
                        padding: "0.9rem 0.5rem",
                        borderBottom: "1px solid rgba(79,172,254,0.2)",
                      }}
                    >
                      {tx.type}
                    </td>
                    <td
                      style={{
                        padding: "0.9rem 0.5rem",
                        borderBottom: "1px solid rgba(79,172,254,0.2)",
                      }}
                    >
                      {tx.amount}
                    </td>
                    <td
                      style={{
                        padding: "0.9rem 0.5rem",
                        borderBottom: "1px solid rgba(79,172,254,0.2)",
                      }}
                    >
                      <span
                        className="badge"
                        style={{
                          padding: "0.2rem 0.6rem",
                          borderRadius: 20,
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          background:
                            tx.status === "success" ? "#4cd96420" : "#ffb34720",
                          color:
                            tx.status === "success" ? "#4cd964" : "#ffb347",
                          border:
                            tx.status === "success"
                              ? "1px solid #4cd96440"
                              : "1px solid #ffb34740",
                        }}
                      >
                        {tx.status === "success" ? "Completed" : "Pending"}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "0.9rem 0.5rem",
                        borderBottom: "1px solid rgba(79,172,254,0.2)",
                      }}
                    >
                      {tx.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* FontAwesome CDN for icons */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
      />
    </div>
  );
}
