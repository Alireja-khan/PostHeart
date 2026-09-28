import imageCompression from 'browser-image-compression';

let cachedSignature: { data: any; expiry: number } | null = null;

async function getUploadSignature() {
  const now = Date.now();
  if (cachedSignature && now < cachedSignature.expiry) {
    return cachedSignature.data;
  }
  const signRes = await fetch('/api/upload/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ params: {} })
  });
  
  if (!signRes.ok) {
    throw new Error("Failed to get upload signature");
  }
  
  const signData = await signRes.json();
  if (!signData.success) {
    throw new Error("Failed to sign upload request");
  }

  // Cloudinary signatures with timestamps are valid for at least 1 hour.
  // We cache for 50 seconds to make batch/parallel uploads instant.
  cachedSignature = { data: signData, expiry: now + 50000 };
  return signData;
}

export async function uploadFile(
  file: File, 
  onProgress?: (percent: number) => void
): Promise<string> {
  let fileToUpload = file;

  // Ultra-fast smart image handling:
  // Only compress if image is > 1.2MB. If smaller, uploading directly is 10x faster.
  if (file.type.startsWith('image/') && file.size > 1.2 * 1024 * 1024) {
    try {
      const options = {
        maxSizeMB: 1.2,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        maxIteration: 4,
        initialQuality: 0.85,
      };
      fileToUpload = await imageCompression(file, options);
    } catch (error) {
      console.warn("Fast compression fallback, using original file:", error);
    }
  }

  // 1. Get cached or fresh signature from server
  const signData = await getUploadSignature();

  // 2. Prepare Form Data for Cloudinary
  const formData = new FormData();
  formData.append('file', fileToUpload);
  formData.append('api_key', signData.api_key);
  formData.append('timestamp', signData.timestamp.toString());
  formData.append('signature', signData.signature);
  formData.append('folder', signData.folder);

  // Determine resource type: images -> image, audio -> video, other -> auto
  let resourceType = 'auto';
  if (file.type.startsWith('image/')) {
    resourceType = 'image';
  } else if (
    file.type.startsWith('audio/') || 
    file.name.endsWith('.mp3') || 
    file.name.endsWith('.m4a') || 
    file.name.endsWith('.wav') || 
    file.name.endsWith('.webm') || 
    file.name.endsWith('.ogg') ||
    file.name.endsWith('.aac') ||
    file.name.endsWith('.flac') ||
    file.name.endsWith('.mp4')
  ) {
    resourceType = 'video';
  }

  const url = `https://api.cloudinary.com/v1_1/${signData.cloud_name}/${resourceType}/upload`;

  // 3. Upload with XHR to track real-time upload progress for user feedback
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve(data.secure_url);
        } catch (e) {
          reject(new Error("Invalid response from Cloudinary"));
        }
      } else {
        console.error("Upload error response:", xhr.responseText);
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error during Cloudinary upload"));
    };

    xhr.send(formData);
  });
}
