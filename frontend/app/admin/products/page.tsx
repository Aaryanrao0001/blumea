'use client';

import { useState, useEffect } from 'react';

interface Product {
  _id: string;
  name: string;
  brand: string;
  slug: string;
  category: string;
  skinTypes: string[];
  price?: number;
  currency?: string;
  createdAt: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'serum' as 'cleanser' | 'moisturizer' | 'serum' | 'sunscreen' | 'treatment' | 'other',
    imageUrl: 'https://placehold.co/600x600/1A1A1A/D4AF37?text=Product',
    productUrl: '',
    ingredientListRaw: '',
    skinTypes: '',
    price: '',
    currency: 'USD',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          skinTypes: formData.skinTypes.split(',').map((s) => s.trim()).filter(Boolean),
          price: formData.price ? parseFloat(formData.price) : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
        setShowForm(false);
        setFormData({
          name: '',
          brand: '',
          category: 'serum',
          imageUrl: 'https://placehold.co/600x600/1A1A1A/D4AF37?text=Product',
          productUrl: '',
          ingredientListRaw: '',
          skinTypes: '',
          price: '',
          currency: 'USD',
        });
      }
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  if (loading) {
    return <div className="text-text-secondary">Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold text-text-primary">Products</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-accent text-bg-primary px-4 py-2 rounded-md font-medium hover:bg-accent-hover transition-colors"
        >
          {showForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-bg-secondary rounded-lg p-6 border border-border-subtle space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary text-sm mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-3 py-2 text-text-primary"
                required
              />
            </div>
            <div>
              <label className="block text-text-secondary text-sm mb-1">Brand</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-3 py-2 text-text-primary"
                required
              />
            </div>
            <div>
              <label className="block text-text-secondary text-sm mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as 'cleanser' | 'moisturizer' | 'serum' | 'sunscreen' | 'treatment' | 'other' })}
                className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-3 py-2 text-text-primary"
              >
                <option value="serum">Serum</option>
                <option value="moisturizer">Moisturizer</option>
                <option value="cleanser">Cleanser</option>
                <option value="sunscreen">Sunscreen</option>
                <option value="treatment">Treatment</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-text-secondary text-sm mb-1">Product URL</label>
              <input
                type="url"
                value={formData.productUrl}
                onChange={(e) => setFormData({ ...formData, productUrl: e.target.value })}
                className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-3 py-2 text-text-primary"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-text-secondary text-sm mb-1">Ingredients (comma separated)</label>
              <textarea
                value={formData.ingredientListRaw}
                onChange={(e) => setFormData({ ...formData, ingredientListRaw: e.target.value })}
                className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-3 py-2 text-text-primary"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-text-secondary text-sm mb-1">Skin Types (comma separated)</label>
              <input
                type="text"
                value={formData.skinTypes}
                onChange={(e) => setFormData({ ...formData, skinTypes: e.target.value })}
                className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-3 py-2 text-text-primary"
                placeholder="oily, combination, dry"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-text-secondary text-sm mb-1">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-3 py-2 text-text-primary"
                />
              </div>
              <div className="w-24">
                <label className="block text-text-secondary text-sm mb-1">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-3 py-2 text-text-primary"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-accent text-bg-primary px-4 py-2 rounded-md font-medium hover:bg-accent-hover transition-colors"
            >
              Create Product
            </button>
          </div>
        </form>
      )}

      {products.length === 0 ? (
        <div className="bg-bg-secondary rounded-lg p-8 text-center border border-border-subtle">
          <p className="text-text-secondary">No products found. Add your first product!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-bg-secondary rounded-lg p-6 border border-border-subtle"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="px-2 py-1 rounded text-xs font-medium bg-accent/20 text-accent">
                  {product.category}
                </span>
                <button
                  onClick={() => handleDelete(product._id)}
                  className="text-red-400 hover:text-red-300 transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
              <h3 className="font-semibold text-text-primary">{product.name}</h3>
              <p className="text-text-secondary text-sm">{product.brand}</p>
              {product.price && (
                <p className="text-accent mt-2">
                  {product.currency || '$'}{product.price}
                </p>
              )}
              <div className="flex flex-wrap gap-1 mt-2">
                {product.skinTypes?.map((type) => (
                  <span
                    key={type}
                    className="px-2 py-0.5 rounded text-xs bg-bg-tertiary text-text-tertiary"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
