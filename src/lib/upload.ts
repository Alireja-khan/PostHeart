export async function uploadFile(file: File): Promise<string> {
  // 1. Get signature from server
  const signRes = await fetch('/api/upload/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      params: {}
    })
  });
  
  if (!signRes.ok) {
    throw new Error("Failed to get upload signature");
  }
  
  const signData = await signRes.json();
  if (!signData.success) {
    throw new Error("Failed to sign upload request");
  }

  // 2. Prepare Form Data for Cloudinary
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', signData.api_key);
  formData.append('timestamp', signData.timestamp.toString());
  formData.append('signature', signData.signature);
  formData.append('folder', signData.folder);

  // Determine resource type: images -> image, audio -> video, other -> auto
  // Note: Cloudinary expects audio files to be uploaded with resource_type: "video"!
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

  // 3. Upload directly to Cloudinary
  const url = `https://api.cloudinary.com/v1_1/${signData.cloud_name}/${resourceType}/upload`;
  const uploadRes = await fetch(url, {
    method: 'POST',
    body: formData
  });

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text();
    console.error("Direct upload to Cloudinary failed:", errorText);
    throw new Error(`Upload failed: ${uploadRes.statusText}`);
  }

  const uploadData = await uploadRes.json();
  return uploadData.secure_url;
}
