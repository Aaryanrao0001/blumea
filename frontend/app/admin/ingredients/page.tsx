'use client';

import { useState, useEffect } from 'react';

interface Ingredient {
  _id: string;
  name: string;
  aliases: string[];
  category: string;
  safetyRating: number;
  benefits: string[];
  concerns: string[];
  evidenceLevel: string;
  createdAt: string;
}

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    aliases: '',
    category: 'active' as 'active' | 'emollient' | 'fragrance' | 'preservative' | 'surfactant' | 'other',
    safetyRating: 4,
    benefits: '',
    concerns: '',
    bestForSkinTypes: '',
    avoidForSkinTypes: '',
    evidenceLevel: 'moderate' as 'strong' | 'moderate' | 'limited' | 'anecdotal',
  });

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const res = await fetch('/api/admin/ingredients');
      const data = await res.json();
      setIngredients(data.ingredients || []);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          aliases: formData.aliases.split(',').map((a) => a.trim()).filter(Boolean),
          benefits: formData.benefits.split(',').map((b) => b.trim()).filter(Boolean),
          concerns: formData.concerns.split(',').map((c) => c.trim()).filter(Boolean),
          bestForSkinTypes: formData.bestForSkinTypes.split(',').map((s) => s.trim()).filter(Boolean),
          avoidForSkinTypes: formData.avoidForSkinTypes.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchIngredients();
        setShowForm(false);
        setFormData({
          name: '',
          aliases: '',
          category: 'active',
          safetyRating: 4,
          benefits: '',
          concerns: '',
          bestForSkinTypes: '',
          avoidForSkinTypes: '',
          evidenceLevel: 'moderate',
        });
      }
    } catch (error) {
      console.error('Error creating ingredient:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ingredient?')) return;
    try {
      const res = await fetch(`/api/admin/ingredients?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchIngredients();
      }
    } catch (error) {
      console.error('Error deleting ingredient:', error);
    }
  };

  const getSafetyColor = (rating: number) => {
    if (rating >= 4) return 'text-green-400';
    if (rating >= 3) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return <div className="text-text-secondary">Loading ingredients...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold text-text-primary">Ingredients</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-accent text-bg-primary px-4 py-2 rounded-md font-medium hover:bg-accent-hover transition-colors"
        >
          {showForm ? 'Cancel' : 'Add Ingredient'}
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
              <label className="block text-text-secondary text-sm mb-1">Aliases (comma separated)</label>
              <input
                type="text"
                value={formData.aliases}
                onChange={(e) => setFormData({ ...formData, aliases: e.target.value })}
                className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-3 py-2 text-text-primary"
              />
            </div>
            <div>
              <label className="block text-text-secondary text-sm mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as 'active' | 'emollient' | 'fragrance' | 'preservative' | 'surfactant' | 'other' })}
                className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-3 py-2 text-text-primary"
              >
                <option value="active">Active</option>
                <option value="emollient">Emollient</option>
                <option value="fragrance">Fragrance</option>
                <option value="preservative">Preservative</option>
                <option value="surfactant">Surfactant</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-text-secondary text-sm mb-1">Safety Rating (0-5)</label>
              <input
                type="number"
                min="0"
                max="5"
                value={formData.safetyRating}
                onChange={(e) => setFormData({ ...formData, safetyRating: parseInt(e.target.value) })}
                className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-3 py-2 text-text-primary"
                required
              />
            </div>
            <div>
              <label className="block text-text-secondary text-sm mb-1">Evidence Level</label>
              <select
                value={formData.evidenceLevel}
                onChange={(e) => setFormData({ ...formData, evidenceLevel: e.target.value as 'strong' | 'moderate' | 'limited' | 'anecdotal' })}
                className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-3 py-2 text-text-primary"
              >
                <option value="strong">Strong</option>
                <option value="moderate">Moderate</option>
                <option value="limited">Limited</option>
                <option value="anecdotal">Anecdotal</option>
              </select>
            </div>
            <div>
              <label className="block text-text-secondary text-sm mb-1">Benefits (comma separated)</label>
              <input
                type="text"
                value={formData.benefits}
                onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-3 py-2 text-text-primary"
              />
            </div>
            <div>
              <label className="block text-text-secondary text-sm mb-1">Concerns (comma separated)</label>
              <input
                type="text"
                value={formData.concerns}
                onChange={(e) => setFormData({ ...formData, concerns: e.target.value })}
                className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-3 py-2 text-text-primary"
              />
            </div>
            <div>
              <label className="block text-text-secondary text-sm mb-1">Best For Skin Types (comma separated)</label>
              <input
                type="text"
                value={formData.bestForSkinTypes}
                onChange={(e) => setFormData({ ...formData, bestForSkinTypes: e.target.value })}
                className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-3 py-2 text-text-primary"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-accent text-bg-primary px-4 py-2 rounded-md font-medium hover:bg-accent-hover transition-colors"
            >
              Create Ingredient
            </button>
          </div>
        </form>
      )}

      {ingredients.length === 0 ? (
        <div className="bg-bg-secondary rounded-lg p-8 text-center border border-border-subtle">
          <p className="text-text-secondary">No ingredients found. Add your first ingredient!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ingredients.map((ingredient) => (
            <div
              key={ingredient._id}
              className="bg-bg-secondary rounded-lg p-6 border border-border-subtle"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="px-2 py-1 rounded text-xs font-medium bg-bg-tertiary text-text-tertiary">
                  {ingredient.category}
                </span>
                <button
                  onClick={() => handleDelete(ingredient._id)}
                  className="text-red-400 hover:text-red-300 transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
              <h3 className="font-semibold text-text-primary">{ingredient.name}</h3>
              {ingredient.aliases?.length > 0 && (
                <p className="text-text-tertiary text-xs mt-1">
                  Also: {ingredient.aliases.slice(0, 2).join(', ')}
                </p>
              )}
              <div className="flex items-center gap-4 mt-3">
                <div>
                  <span className="text-text-tertiary text-xs">Safety</span>
                  <p className={`font-bold ${getSafetyColor(ingredient.safetyRating)}`}>
                    {ingredient.safetyRating}/5
                  </p>
                </div>
                <div>
                  <span className="text-text-tertiary text-xs">Evidence</span>
                  <p className="text-text-secondary text-sm">{ingredient.evidenceLevel}</p>
                </div>
              </div>
              {ingredient.benefits?.length > 0 && (
                <p className="text-green-400 text-xs mt-2">
                  ✓ {ingredient.benefits[0]}
                </p>
              )}
              {ingredient.concerns?.length > 0 && (
                <p className="text-red-400 text-xs mt-1">
                  ! {ingredient.concerns[0]}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
