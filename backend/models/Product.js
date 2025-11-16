
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  fabric: { type: String, required: true },
  colors: [String],
  sizes: [String],
  isNew: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  onSale: { type: Boolean, default: false },
  images: [String],
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

const Product = mongoose.model('Product', ProductSchema);
export default Product;