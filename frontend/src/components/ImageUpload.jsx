import { useState, useRef } from 'react';
import { Upload, X, Image, CheckCircle } from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function ImageUpload({ onUpload, label='Upload Image',
  endpoint='image', accept='image/*', existingUrl=null }) {

  const [preview,    setPreview]    = useState(existingUrl);
  const [uploading,  setUploading]  = useState(false);
  const [uploaded,   setUploaded]   = useState(!!existingUrl);
  const inputRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024)
      return toast.error('File too large. Max 5MB');

    // Preview
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target.result);
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append(endpoint === 'license' ? 'license' : 'image', file);
      const { data } = await API.post(
        `/upload/${endpoint}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setUploaded(true);
      onUpload(data.url);
      toast.success('Uploaded successfully!');
    } catch {
      toast.error('Upload failed. Try again.');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const clear = () => {
    setPreview(null);
    setUploaded(false);
    onUpload(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <label className="block text-xs font-semibold text-gray-500
                        dark:text-gray-400 uppercase mb-2">{label}</label>

      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 dark:border-gray-600
                     rounded-2xl p-8 text-center cursor-pointer
                     hover:border-blue-400 dark:hover:border-blue-500
                     hover:bg-blue-50 dark:hover:bg-blue-900/10
                     transition-all group">
          <Image size={32} className="mx-auto text-gray-300 dark:text-gray-600
                                      group-hover:text-blue-400 mb-3 transition-colors"/>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Drag & drop or click to upload
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            JPG, PNG, WEBP · Max 5MB
          </p>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border
                        border-gray-200 dark:border-gray-700">
          <img src={preview} alt="preview"
            className="w-full h-48 object-cover"/>
          <div className="absolute inset-0 bg-black/20 flex items-center
                          justify-center opacity-0 hover:opacity-100 transition-opacity">
            <button onClick={clear}
              className="w-10 h-10 bg-red-500 rounded-full flex items-center
                         justify-center text-white hover:bg-red-600 transition-colors">
              <X size={18}/>
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center
                            justify-center">
              <div className="w-8 h-8 border-3 border-white/30 border-t-white
                              rounded-full animate-spin"/>
            </div>
          )}
          {uploaded && !uploading && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5
                            bg-green-500 text-white px-2.5 py-1 rounded-full
                            text-xs font-semibold">
              <CheckCircle size={12}/> Uploaded
            </div>
          )}
        </div>
      )}

      <input ref={inputRef} type="file" accept={accept}
        className="hidden"
        onChange={e => handleFile(e.target.files[0])}/>
    </div>
  );
}