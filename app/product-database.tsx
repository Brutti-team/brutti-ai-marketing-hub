"use client";

import { useMemo, useState } from "react";
import {
  bruttiProducts,
  productCategories,
  productSource,
} from "./brutti-product-data";

const missingValue = (value: string) =>
  /not stated|maklumat tidak ditemui/i.test(value);

export default function ProductDatabase() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");

  const products = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return bruttiProducts.filter((product) => {
      const matchesCategory =
        category === "All categories" || product.category === category;
      const matchesQuery =
        !needle ||
        [product.name, product.category, product.material, product.colour]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  const completeCount = bruttiProducts.filter(
    (product) =>
      !missingValue(product.price) &&
      !missingValue(product.material) &&
      !missingValue(product.dimensions) &&
      !missingValue(product.colour)
  ).length;

  return (
    <section className="panel product-panel">
      <div className="panel-heading product-heading">
        <div>
          <p className="eyebrow">Verified Notion records</p>
          <h3>BRUTTI product catalogue</h3>
          <p>
            Full product details from the official Product Database. Images are
            intentionally left pending until the product photo library is ready.
          </p>
        </div>
        <span className="snapshot-label">Embedded in website</span>
      </div>

      <div className="product-summary" aria-label="Product database summary">
        <div><strong>{bruttiProducts.length}</strong><span>Active products</span></div>
        <div><strong>{productCategories.length}</strong><span>Categories</span></div>
        <div><strong>{completeCount}</strong><span>Complete core details</span></div>
        <div><strong>{bruttiProducts.length - completeCount}</strong><span>Need data review</span></div>
      </div>

      <div className="product-toolbar">
        <label>
          <span>Search products</span>
          <input
            type="search"
            placeholder="Search name, category, material or colour"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label>
          <span>Category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option>All categories</option>
            {productCategories.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </div>

      <div className="product-result-bar">
        <span>Showing {products.length} of {bruttiProducts.length} products</span>
        <small>Source checked: {productSource.verifiedAt}</small>
      </div>

      {products.length ? (
        <div className="product-grid">
          {products.map((product) => (
            <article className="product-card" key={product.id}>
              <div className="product-card-top">
                <div className="product-photo-placeholder" aria-label="Product image pending">
                  <span>Image pending</span>
                </div>
                <div>
                  <small>Product {String(product.id).padStart(2, "0")}</small>
                  <h4>{product.name}</h4>
                  <span className="category-pill">{product.category}</span>
                </div>
              </div>
              <dl className="product-details">
                <div><dt>Selling price</dt><dd className={missingValue(product.price) ? "missing" : ""}>{product.price}</dd></div>
                <div><dt>Material</dt><dd className={missingValue(product.material) ? "missing" : ""}>{product.material}</dd></div>
                <div><dt>Size / dimensions</dt><dd className={missingValue(product.dimensions) ? "missing" : ""}>{product.dimensions}</dd></div>
                <div><dt>Colour</dt><dd className={missingValue(product.colour) ? "missing" : ""}>{product.colour}</dd></div>
                <div><dt>Status</dt><dd><span className="active-pill">{product.status}</span></dd></div>
              </dl>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state compact-empty">
          <span className="empty-icon">⌕</span>
          <h4>No matching product found.</h4>
          <p>Try another keyword or choose All categories.</p>
        </div>
      )}

      <p className="product-source-note">
        Missing values are shown exactly as recorded in Notion. Prices marked
        “Starts from” may vary for custom orders. Confirm final quotations before publishing.
      </p>
    </section>
  );
}
