import os
import random
from gradio_client import Client, handle_file
from fastapi import HTTPException

class AIService:
    def __init__(self):
        # We don't need a token for public spaces usually, but can support it if needed
        # Use HF_TOKEN if available to avoid "Unlogged user" rate limits
        # Use HF_TOKEN if available to avoid "Unlogged user" rate limits
        token = os.getenv("HF_TOKEN")
        if token:
            print(f"HF_TOKEN loaded: {token[:4]}...{token[-4:]}")
        else:
            print("WARNING: No HF_TOKEN found. Using anonymous mode.")
        self.client = Client("InstantX/InstantID", token=token)

    def run_instant_id(self, image_path: str, pose_path: str = None):
        try:
            # If user provided a pose, use it. Otherwise default to template.jpg
            if pose_path:
                target_pose_path = pose_path
            else:
                target_pose_path = "template.jpg"

            # Ensure paths are absolute or correctly resolved for gradio_client
            abs_image_path = os.path.abspath(image_path)
            abs_template_path = os.path.abspath(target_pose_path)

            if not os.path.exists(abs_template_path):
                 print("WARNING: Template image not found.")
                 return None
            
            print(f"Sending to HF Space... Face: {abs_image_path}, Pose: {abs_template_path}")

            # Using the /generate_image endpoint from the user's snippet
            result = self.client.predict(
                face_image_path=handle_file(abs_image_path),
                pose_image_path=handle_file(abs_template_path),
                prompt="illustration of a cute child, magical storybook style, vibrant, high quality, disney style",
                negative_prompt="(lowres, low quality, worst quality:1.2), (text:1.2), watermark, (frame:1.2), deformed, ugly, deformed eyes, blur, out of focus, blurry, deformed cat, deformed, photo, anthropomorphic cat, monochrome, pet collar, gun, weapon, blue, 3d, drones, drone, buildings in background, green",
                style_name="Watercolor",
                num_steps=30,
                identitynet_strength_ratio=0.8,
                adapter_strength_ratio=0.8,
                canny_strength=0.4,
                depth_strength=0.4,
                controlnet_selection=["depth"],
                guidance_scale=5,
                seed=random.randint(0, 2147483647), # Randomize seed for variants
                scheduler="EulerDiscreteScheduler",
                enable_LCM=False,
                enhance_face_region=True,
                api_name="/generate_image"
            )
            
            # Result is a tuple: (filepath, usage_tips)
            if result and len(result) > 0:
                generated_path = result[0]
                # Gradio client saves the file in a temp dir. We might want to move it or just return the path to read.
                # However, the frontend expects a URL.
                # simpler approach: we return the path, and the router will read and serve it or copy it.
                # But the router expects a URL.
                # Creating a copy in static folder is best practice here.
                
                output_filename = f"gen_{os.path.basename(image_path)}"
                destination = os.path.join("static", output_filename)
                
                import shutil
                shutil.copy(generated_path, destination)
                
                # Convert absolute path to local URL for frontend
                # assuming running on localhost:8000
                return f"http://localhost:8000/static/{output_filename}"
                
            return None

        except Exception as e:
            print(f"HF Space Error: {e}")
            raise HTTPException(status_code=500, detail=f"AI Service Error: {str(e)}")

# Singleton instance
ai_service = AIService()
