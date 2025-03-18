import { useState } from "react";

export default function SellPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [country, setCountry] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");

  // 🖼️ Handle Image Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!title || !description || !price || !country || !image) {
      setMessage("⚠️ Please fill out all fields and select an image.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("country", country);
    formData.append("image", image);

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("❌ You must be logged in to sell products.");
      return;
    }

    console.log("🛠️ Sending API Request to:", `${process.env.NEXT_PUBLIC_API_URL}/add-product`);
    console.log("🛠️ FormData Content:");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/add-product`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      console.log("🛠️ Raw Response Status:", response.status);
      const text = await response.text();
      console.log("🛠️ Raw Response Body:", text);

      try {
        const data = JSON.parse(text);
        if (response.ok) {
          setMessage("✅ Product added successfully!");
        } else {
          setMessage(`❌ Error: ${data.error || "Unknown error"}`);
        }
      } catch (error) {
        console.error("❌ JSON Parsing Error:", error);
        setMessage(`❌ Server returned invalid JSON: ${text}`);
      }
    } catch (error) {
      console.error("❌ Fetch Error:", error);
      setMessage("❌ Failed to upload product.");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Sell a Product</h1>
      {message && <p className="mb-4 text-center text-red-500">{message}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Product Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border rounded mb-2" />
        <textarea placeholder="Product Description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 border rounded mb-2" />
        <input type="number" placeholder="Price (USD)" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full p-2 border rounded mb-2" />
        
        {/* FULL COUNTRY LIST */}
        <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full p-2 border rounded mb-2">
          <option value="">Select a Country</option>
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

        <input type="file" onChange={handleFileChange} className="w-full mb-2" />
        {preview && (
          <div className="mb-2">
            <p className="text-gray-500">Preview:</p>
            <img src={preview} alt="Preview" className="w-full h-32 object-cover rounded" />
          </div>
        )}
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Upload Product</button>
      </form>
    </div>
  );
}

