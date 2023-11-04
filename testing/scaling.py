import os
import hashlib
import requests
import threading
import concurrent.futures

# The directory where your .mp4 files are located
VIDEO_DIR = '/path/to/your/video/folder'
# The endpoint to which you want to post the video hash
UPLOAD_ENDPOINT = 'http://group109lb-1372671419.ap-southeast-2.elb.amazonaws.com/api/video/upload'

# Function to compute the SHA-256 hash of a file
def compute_hash(file_path):
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

# Function to upload the video hash and then upload the video file to the returned URL
def process_and_upload_video(file_path):
    # Compute the hash of the video
    video_hash = compute_hash(file_path)
    # Post the hash to the server and get the presigned URL for upload
    response = requests.post(UPLOAD_ENDPOINT, json={'video_hash': video_hash})

    if response.status_code == 200:
        data = response.json()
        if 's3Url' in data:
            presigned_url = data['s3Url']
            # Upload the video to the presigned URL
            with open(file_path, 'rb') as video_file:
                upload_response = requests.put(presigned_url, data=video_file, headers={'Content-Type': 'video/mp4'})

            if upload_response.status_code == 200:
                print(f"Successfully uploaded {file_path} to S3")
            else:
                print(f"Failed to upload {file_path}, Status Code: {upload_response.status_code}")
        else:
            print(f"No upload URL received for {file_path}, it may already be processed.")
    else:
        print(f"Failed to get upload URL for {file_path}, Status Code: {response.status_code}")

# Function to list all video files and process them for upload
def upload_all_videos(directory):
    video_files = [f for f in os.listdir(directory) if f.endswith('.mp4')]

    with concurrent.futures.ThreadPoolExecutor() as executor:
        for video_file in video_files:
            file_path = os.path.join(directory, video_file)
            executor.submit(process_and_upload_video, file_path)

if __name__ == '__main__':
    upload_all_videos(VIDEO_DIR)
