/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import Navbar from "../../componenets/navbar/Navbar";
import { auth, db } from "../../firebaseConfig/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import "./AppointmentPage.css";

function Appointments() {
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState("success");
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [currentTokens, setCurrentTokens] = useState({});

  const showSuccessAlert = (msg) => {
    setAlertMsg(msg);
    setAlertType("success");
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 2500);
  };

  useEffect(() => {
    let unsubscribe;
    const listen = async () => {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        setItems([]);
        setLoading(false);
        return;
      }
      const q = query(
        collection(db, "appointments"),
        where("clientUserId", "==", user.uid)
      );
      unsubscribe = onSnapshot(q, (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const na =
              typeof a.queueNumber === "number"
                ? a.queueNumber
                : parseInt(
                    (a.queueNumber || "0").toString().replace(/\D+/g, ""),
                    10
                  ) || 0;
            const nb =
              typeof b.queueNumber === "number"
                ? b.queueNumber
                : parseInt(
                    (b.queueNumber || "0").toString().replace(/\D+/g, ""),
                    10
                  ) || 0;
            return na - nb;
          });
        setItems(list);
        setLoading(false);
      });
    };
    listen();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Fetch currentToken for each business referenced in the user's appointments
  useEffect(() => {
    const loadCurrentTokens = async () => {
      try {
        const ids = Array.from(
          new Set(
            items
              .map((a) => a.businessId)
              .filter((v) => typeof v === "string" && v.trim().length > 0)
          )
        );
        if (ids.length === 0) {
          setCurrentTokens({});
          return;
        }
        const results = await Promise.all(
          ids.map(async (id) => {
            try {
              const snap = await getDoc(doc(db, "businessRegistrations", id));
              const data = snap.exists() ? snap.data() : null;
              return [id, Number(data?.currentToken ?? 0)];
            } catch {
              return [id, 0];
            }
          })
        );
        const mapObj = Object.fromEntries(results);
        setCurrentTokens(mapObj);
      } catch {
        // ignore
      }
    };

    loadCurrentTokens();
  }, [items]);

  const fmt = (date) => {
    if (!date) return "N/A";
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString();
  };

  const normalizeStatus = (s) => {
    const t = (s || "").toString().trim().toUpperCase();
    if (["SERVED", "COMPLETED", "DONE"].includes(t)) return "SERVED";
    if (["CURRENT", "SERVING", "IN_PROGRESS", "NOW_SERVING"].includes(t))
      return "CURRENT";
    return "PENDING";
  };

  const statusClass = (s) => {
    const t = normalizeStatus(s);
    if (t === "CURRENT") return "is-current";
    if (t === "SERVED") return "is-served";
    return "is-pending";
  };

  const buckets = items.reduce(
    (acc, apt) => {
      const t = normalizeStatus(apt.status);
      if (t === "CURRENT") acc.current.push(apt);
      else if (t === "SERVED") acc.served.push(apt);
      else acc.pending.push(apt);
      return acc;
    },
    { current: [], pending: [], served: [] }
  );

  return (
    <>
      <Navbar />
      <div className="appointmentPage">
        <div className="centerWrap">
          <h2 className="pageTitle">Your Appointments</h2>
          {showAlert && (
            <div
              style={{
                position: "fixed",
                bottom: "2%",
                right: "2%",
                zIndex: 1000,
              }}
            >
              <Alert type={alertType} message={alertMsg} />
            </div>
          )}
          {loading ? (
            <div className="loading">Loading…</div>
          ) : items.length === 0 ? (
            <div className="empty">No appointments yet.</div>
          ) : (
            <div className="appointmentsColumns">
              <section className="column">
                <header className="columnHeader">
                  <h3 className="columnTitle">Current</h3>
                </header>
                <div className="cards">
                  {buckets.current.length === 0 ? (
                    <div className="emptyColumn">No current appointments</div>
                  ) : (
                    buckets.current.map((apt) => (
                      <div className="appointmentCard" key={apt.id}>
                        <div className="cardTop">
                          <strong className="token">
                            Token #{apt.queueNumber}
                          </strong>
                          <span
                            className={`statusChip ${statusClass(apt.status)}`}
                          >
                            {apt.status || "Pending"}
                          </span>
                        </div>
                        <div className="currentTokenRow">
                          <span className="currentTokenLabel">
                            Current Token:
                          </span>
                          <span className="currentTokenBadge">
                            {currentTokens[apt.businessId] ?? 0}
                          </span>
                        </div>
                        <div className="cardMeta">
                          <div className="metaRow">
                            <span className="label">Business:</span>
                            <span className="value">
                              {apt.businessName || apt.businessId}
                            </span>
                          </div>
                          <div className="metaRow">
                            <span className="label">Time:</span>
                            <span className="value">
                              {fmt(apt.appointmentDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
              <section className="column">
                <header className="columnHeader">
                  <h3 className="columnTitle">Pending</h3>
                </header>
                <div className="cards">
                  {buckets.pending.length === 0 ? (
                    <div className="emptyColumn">No pending appointments</div>
                  ) : (
                    buckets.pending.map((apt) => (
                      <div className="appointmentCard" key={apt.id}>
                        <div className="cardTop">
                          <strong className="token">
                            Token #{apt.queueNumber}
                          </strong>
                          <span
                            className={`statusChip ${statusClass(apt.status)}`}
                          >
                            {apt.status || "Pending"}
                          </span>
                        </div>
                        <div className="currentTokenRow">
                          <span className="currentTokenLabel">
                            Current Token:
                          </span>
                          <span className="currentTokenBadge">
                            {currentTokens[apt.businessId] ?? 0}
                          </span>
                        </div>
                        <div className="cardMeta">
                          <div className="metaRow">
                            <span className="label">Business:</span>
                            <span className="value">
                              {apt.businessName || apt.businessId}
                            </span>
                          </div>
                          <div className="metaRow">
                            <span className="label">Time:</span>
                            <span className="value">
                              {fmt(apt.appointmentDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
              <section className="column">
                <header className="columnHeader">
                  <h3 className="columnTitle">Served</h3>
                </header>
                <div className="cards">
                  {buckets.served.length === 0 ? (
                    <div className="emptyColumn">No served appointments</div>
                  ) : (
                    buckets.served.map((apt) => (
                      <div className="appointmentCard" key={apt.id}>
                        <div className="cardTop">
                          <strong className="token">
                            Token #{apt.queueNumber}
                          </strong>
                          <span
                            className={`statusChip ${statusClass(apt.status)}`}
                          >
                            {apt.status || "Served"}
                          </span>
                        </div>
                        <div className="currentTokenRow">
                          <span className="currentTokenLabel">
                            Current Token:
                          </span>
                          <span className="currentTokenBadge">
                            {currentTokens[apt.businessId] ?? 0}
                          </span>
                        </div>
                        <div className="cardMeta">
                          <div className="metaRow">
                            <span className="label">Business:</span>
                            <span className="value">
                              {apt.businessName || apt.businessId}
                            </span>
                          </div>
                          <div className="metaRow">
                            <span className="label">Time:</span>
                            <span className="value">
                              {fmt(apt.appointmentDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Appointments;
