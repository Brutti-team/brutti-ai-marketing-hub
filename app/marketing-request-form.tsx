"use client";

import { FormEvent, useState } from "react";
import { bruttiProducts } from "./brutti-product-data";

const initialForm = {
  name: "",
  platform: "Facebook",
  contentType: "Facebook Post",
  productName: "",
  objective: "",
  keyMessage: "",
  promotion: "",
  language: "Bahasa Melayu",
};

export default function MarketingRequestForm() {
  const [form, setForm] = useState(initialForm);
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  function updateField(name: keyof typeof initialForm, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setMessage("");

    try {
      const response = await fetch("/api/marketing-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Request could not be sent.");
      }

      window.dispatchEvent(new Event("brutti-request-created"));

      setForm(initialForm);
      setState("success");
      setMessage("Request saved successfully in the Hub.");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Request could not be sent.");
    }
  }

  return (
    <form className="request-form" onSubmit={submitRequest}>
      <div className="form-grid">
        <label className="field field-wide">
          <span>Request name *</span>
          <input
            name="name"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Example: Facebook product launch post"
            required
          />
        </label>

        <label className="field">
          <span>Platform *</span>
          <select
            name="platform"
            value={form.platform}
            onChange={(event) => updateField("platform", event.target.value)}
          >
            <option>Facebook</option>
          </select>
          <small className="field-note">Facebook only for now</small>
        </label>

        <label className="field">
          <span>Content type *</span>
          <select
            name="contentType"
            value={form.contentType}
            onChange={(event) => updateField("contentType", event.target.value)}
          >
            <option>Facebook Post</option>
            <option>Promotion</option>
            <option>Customer reply</option>
            <option>Complaint reply</option>
          </select>
        </label>

        <label className="field">
          <span>Product name</span>
          <select
            name="productName"
            value={form.productName}
            onChange={(event) => updateField("productName", event.target.value)}
          >
            <option value="">General BRUTTI brand</option>
            {bruttiProducts.map((product) => (
              <option key={product.id} value={product.name}>{product.name}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Language *</span>
          <select
            name="language"
            value={form.language}
            onChange={(event) => updateField("language", event.target.value)}
          >
            <option>Bahasa Melayu</option>
            <option>English</option>
            <option>Bahasa Melayu + English</option>
          </select>
        </label>

        <label className="field field-wide">
          <span>Objective *</span>
          <textarea
            name="objective"
            value={form.objective}
            onChange={(event) => updateField("objective", event.target.value)}
            placeholder="What should this content achieve?"
            rows={3}
            required
          />
        </label>

        <label className="field field-wide">
          <span>Key message</span>
          <textarea
            name="keyMessage"
            value={form.keyMessage}
            onChange={(event) => updateField("keyMessage", event.target.value)}
            placeholder="Main message the audience should remember"
            rows={3}
          />
        </label>

        <label className="field field-wide">
          <span>Promotion</span>
          <input
            name="promotion"
            value={form.promotion}
            onChange={(event) => updateField("promotion", event.target.value)}
            placeholder="Example: 10% launch discount (leave blank if none)"
          />
        </label>
      </div>

      <div className="form-footer">
        <p className={`form-message ${state}`} aria-live="polite">
          {message || "The request will be saved securely in this Hub."}
        </p>
        <button className="submit-button" type="submit" disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : "Send marketing request"}
        </button>
      </div>
    </form>
  );
}
