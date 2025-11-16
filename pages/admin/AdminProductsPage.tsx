
import React, { useState, useMemo } from 'react';
import { Product } from '../../types';
import { Plus, Edit, Trash2, Search, LoaderCircle, X } from 'lucide-react';
import { useAppStore } from '../../StoreContext';

const ProductFormModal: React.FC<{ product?: Product | null, onSave: (p: any) => Promise<void>, onClose: () => void }> = ({ product, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        name: product?.name || '',
        category: product?.category || '',
        price: product?.price || 0,
        description: product?.description || '',
        fabric: product?.fabric || '',
        colors: product?.colors.join(', ') || '',
        sizes: product?.sizes || [],
        image1: product?.images[0] || '',
        image2: product?.images[1] || '',
        image3: product?.images[2] || '',
        isNew: product?.isNew || true,
        isTrending: product?.isTrending || false,
        onSale: product?.onSale || false,
    });
    const [isSaving, setIsSaving] = useState(false);
    const [newSize, setNewSize] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const name = e.target.name;
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, [name]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const addSize = () => {
        const trimmedSize = newSize.trim();
        if (trimmedSize && !formData.sizes.includes(trimmedSize)) {
            setFormData(prev => ({...prev, sizes: [...prev.sizes, trimmedSize]}));
            setNewSize('');
        }
    };

    const removeSize = (indexToRemove: number) => {
        setFormData(prev => ({...prev, sizes: prev.sizes.filter((_, index) => index !== indexToRemove)}));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const finalData = {
            name: formData.name,
            category: formData.category,
            description: formData.description,
            fabric: formData.fabric,
            price: Number(formData.price),
            colors: formData.colors.split(',').map(s => s.trim()).filter(Boolean),
            sizes: formData.sizes,
            images: [formData.image1, formData.image2, formData.image3].filter(Boolean),
            isNew: formData.isNew,
            isTrending: formData.isTrending,
            onSale: formData.onSale
        };
        await onSave(product ? { ...finalData, id: product.id } : finalData);
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-4">{product ? 'Edit Product' : 'Add New Product'}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="name" value={formData.name} onChange={handleChange} placeholder="Product Name" className="p-2 border rounded w-full md:col-span-2 bg-white text-black" required/>
                            <input name="category" value={formData.category} onChange={handleChange} placeholder="Category" className="p-2 border rounded w-full bg-white text-black" required/>
                            <input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="Price" className="p-2 border rounded w-full bg-white text-black" required/>
                             <input name="fabric" value={formData.fabric} onChange={handleChange} placeholder="Fabric" className="p-2 border rounded w-full md:col-span-2 bg-white text-black"/>
                            <input name="colors" value={formData.colors} onChange={handleChange} placeholder="Colors (comma separated)" className="p-2 border rounded w-full md:col-span-2 bg-white text-black"/>
                            
                            <div className="md:col-span-2 space-y-2 p-3 border rounded-lg bg-gray-50">
                                <label className="block text-sm font-medium text-gray-700">Sizes</label>
                                <div className="flex flex-wrap gap-2 items-center min-h-[2.5rem]">
                                    {formData.sizes.map((size, index) => (
                                        <div key={index} className="flex items-center gap-1 bg-pink-100 text-pink-800 rounded-full px-3 py-1 text-sm font-medium">
                                            <span>{size}</span>
                                            <button type="button" onClick={() => removeSize(index)} className="text-pink-600 hover:text-pink-800 transition-colors">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.sizes.length === 0 && <p className="text-xs text-gray-500">No sizes added yet.</p>}
                                </div>
                                <div className="flex gap-2 items-center pt-2 border-t mt-2">
                                    <input 
                                        value={newSize} 
                                        onChange={(e) => setNewSize(e.target.value)} 
                                        onKeyDown={(e) => { 
                                            if (e.key === 'Enter' || e.key === ',') { 
                                                e.preventDefault(); 
                                                addSize(); 
                                            } 
                                        }}
                                        placeholder="Type a size (e.g., M or 40-42)" 
                                        className="p-2 border rounded w-full bg-white text-black flex-grow"
                                    />
                                    <button type="button" onClick={addSize} className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition flex-shrink-0">Add</button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Add sizes like 'S', 'Free', or ranges like '45-48'. Press Enter, comma, or click Add.</p>
                            </div>

                            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="p-2 border rounded w-full md:col-span-2 bg-white text-black"/>
                             
                            <div className="md:col-span-2 space-y-3">
                                <h3 className="text-sm font-semibold text-gray-600">Product Images</h3>
                                {[1, 2, 3].map(i => (
                                    <div key={i}>
                                        <label className="text-xs font-medium text-gray-700 block mb-1">Image {i}{i === 1 && ' (Primary)'}</label>
                                        <div className="flex items-center gap-4">
                                            <input 
                                                type="file" 
                                                name={`image${i}`} 
                                                onChange={handleFileChange} 
                                                accept="image/*" 
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                                            />
                                            {formData[`image${i}` as keyof typeof formData] && (
                                                <img src={formData[`image${i}` as keyof typeof formData] as string} alt={`Preview ${i}`} className="w-12 h-12 object-cover rounded-lg flex-shrink-0"/>
                                            )}
                                        </div>
                                    </div>
                                ))}
                             </div>

                             <div className="flex items-center space-x-4 md:col-span-2">
                                <label className="text-black"><input type="checkbox" name="isNew" checked={formData.isNew} onChange={handleChange} className="mr-2"/> New Arrival</label>
                                <label className="text-black"><input type="checkbox" name="isTrending" checked={formData.isTrending} onChange={handleChange} className="mr-2"/> Trending</label>
                                <label className="text-black"><input type="checkbox" name="onSale" checked={formData.onSale} onChange={handleChange} className="mr-2"/> On Sale</label>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-100 p-4 flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                        <button type="submit" disabled={isSaving} className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 flex items-center disabled:bg-pink-400">
                            {isSaving && <LoaderCircle className="w-4 h-4 animate-spin mr-2" />}
                            {isSaving ? 'Saving...' : 'Save Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AdminProductsPage: React.FC = () => {
    const { products, addProduct, updateProduct, deleteProduct } = useAppStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleAdd = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };
    
    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };
    
    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            await deleteProduct(id);
        }
    };

    const handleSave = async (productData: Product | Omit<Product, 'id'>) => {
        if ('id' in productData) {
            await updateProduct(productData);
        } else {
            await addProduct(productData);
        }
        setIsModalOpen(false);
        setEditingProduct(null);
    };
    
    const filteredProducts = useMemo(() => {
        return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [products, searchTerm]);

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-800">Products</h1>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input 
                            type="text"
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 pl-10 border rounded-lg text-sm bg-white text-black"
                        />
                    </div>
                    <button onClick={handleAdd} className="bg-pink-600 text-white px-4 py-2 rounded-lg shadow hover:bg-pink-700 transition flex items-center space-x-2 flex-shrink-0">
                        <Plus className="w-5 h-5" />
                        <span className="hidden sm:inline">Add Product</span>
                    </button>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Product Name</th>
                            <th scope="col" className="px-6 py-3">Category</th>
                            <th scope="col" className="px-6 py-3">Price</th>
                            <th scope="col" className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(product => (
                            <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                                <td className="px-6 py-4">{product.category}</td>
                                <td className="px-6 py-4">৳{product.price.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button onClick={() => handleEdit(product)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-full"><Edit className="w-4 h-4"/></button>
                                    <button onClick={() => handleDelete(product.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><Trash2 className="w-4 h-4"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <ProductFormModal product={editingProduct} onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default AdminProductsPage;