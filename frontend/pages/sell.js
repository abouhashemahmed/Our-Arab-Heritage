import { useState, useEffect } from "react";

export default function SellPage() {
  const [isClient, setIsClient] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [country, setCountry] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");

  // ✅ Fix for SSR (Next.js hydration mismatch)
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImage(null);
      setPreview(null);
      setMessage("❌ Please upload a valid image file");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // ✅ Improved Validation
    if (!title || !description || !price || !country || !image) {
      setMessage("⚠️ Please fill out all fields and select an image.");
      return;
    }

    const formattedPrice = Number(price).toFixed(2);
    if (isNaN(formattedPrice) || formattedPrice <= 0) {
      setMessage("❌ Please enter a valid price");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", formattedPrice);
      formData.append("country", country);
      formData.append("image", image);

      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("❌ Please login first");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/add-product`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const text = await response.text();
      try {
        const data = JSON.parse(text);
        if (response.ok) {
          setMessage("✅ Product added successfully!");
          // ✅ Reset form
          setTitle("");
          setDescription("");
          setPrice("");
          setCountry("");
          setImage(null);
          setPreview(null);
        } else {
          setMessage(`❌ Error: ${data.error || "Unknown error"}`);
        }
      } catch (jsonError) {
        console.error("JSON Parsing Error:", jsonError, "Response:", text);
        setMessage("❌ Invalid server response");
      }
    } catch (error) {
      console.error("Submission Error:", error);
      setMessage("❌ Failed to submit product. Please try again.");
    }
  };

  if (!isClient) return null; // Prevent SSR hydration issues

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg mt-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Sell Your Product</h1>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${message.startsWith("✅") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Product Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <textarea
          placeholder="Product Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <input
          type="number"
          placeholder="Price (USD)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select Country</option>
          <option value="Palestine">Palestine</option>
          <option value="Morocco">Morocco</option>
          <option value="Egypt">Egypt</option>
          <option value="Syria">Syria</option>
          <option value="Lebanon">Lebanon</option>
          <option value="Saudi Arabia">Saudi Arabia</option>
          <option value="Jordan">Jordan</option>
          <option value="Iraq">Iraq</option>
          <option value="Algeria">Algeria</option>
          <option value="Tunisia">Tunisia</option>
          <option value="Libya">Libya</option>
          <option value="Yemen">Yemen</option>
          <option value="Kuwait">Kuwait</option>
          <option value="Oman">Oman</option>
          <option value="Bahrain">Bahrain</option>
          <option value="Qatar">Qatar</option>
          <option value="United Arab Emirates">United Arab Emirates</option>
          <option value="Sudan">Sudan</option>
          <option value="Mauritania">Mauritania</option>
          <option value="Somalia">Somalia</option>
          <option value="Djibouti">Djibouti</option>
          <option value="Comoros">Comoros</option>
        </select>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Product Image</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {preview && (
            <div className="mt-2">
              <img 
                src={preview} 
                alt="Preview" 
                className="w-32 h-32 object-cover rounded-lg border"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          List Product
        </button>
      </form>
    </div>
  );
}
