// import React, { useState } from "react";
// import axios from "axios";
// import { Form, Input, Button, Upload, Select, DatePicker, InputNumber, message } from "antd";
// import { UploadOutlined } from "@ant-design/icons";
// import styles from "./CreateCampaign.module.css"; // ✅ Import CSS for styling

// const { TextArea } = Input;
// const { Option } = Select;

// const CreateCampaign = () => {
//   const [form] = Form.useForm();
//   const [imageFile, setImageFile] = useState(null);
//   const [loading, setLoading] = useState(false);

//   // ✅ Convert Image to Base64
//   const getBase64 = (file) =>
//     new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.readAsDataURL(file);
//       reader.onload = () => resolve(reader.result);
//       reader.onerror = (error) => reject(error);
//     });

//   // ✅ Handle Image Upload
//   const handleImageUpload = async ({ file }) => {
//     try {
//       const base64Image = await getBase64(file);
//       setImageFile(base64Image);
//       message.success(`${file.name} uploaded successfully.`);
//     } catch (error) {
//       message.error("Failed to upload image.");
//     }
//   };

//   // ✅ Handle Form Submission
//   const onFinish = async (values) => {
//     setLoading(true);

//     // Convert Date to ISO Format
//     const formattedDeadline = values.duration[1].toISOString();

//     // Prepare API request body
//     const campaignData = {
//       title: values.title,
//       description: values.description,
//       target_amount: values.goal,
//       deadline: formattedDeadline,
//       currency: "USD", // Set default currency
//       category: values.category,
//       image: imageFile, // Base64 encoded image
//     };

//     try {
//       const token = localStorage.getItem("token"); // ✅ Get Token from Local Storage
//       const response = await axios.post(
//         "https://d854-2600-8807-c182-d000-4c7a-ad7d-926c-e934.ngrok-free.app/campaigns",
//         campaignData,
//         {
//           headers: {
//             "Authorization": `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (response.status === 200 || response.status === 201) {
//         message.success("Campaign created successfully!");
//         form.resetFields(); // ✅ Clear form after submission
//         setImageFile(null); // ✅ Reset image state
//       } else {
//         message.error("Failed to create campaign. Try again.");
//       }
//     } catch (error) {
//       console.error("❌ API Error:", error);
//       message.error("Error creating campaign. Check your inputs or try again later.");
//     }

//     setLoading(false);
//   };

//   return (
//     <div className={styles.pageContainer}>
//       <div className={styles.overlay}>
//         <div className={styles.formContainer}>
//           <h2 className={styles.title}>Create a New Campaign</h2>

//           <Form
//             form={form}
//             layout="vertical"
//             onFinish={onFinish}
//             className={styles.form}
//           >
//             {/* 📌 Campaign Title */}
//             <Form.Item
//               label="Campaign Title"
//               name="title"
//               rules={[{ required: true, message: "Please enter a campaign title!" }]}
//             >
//               <Input placeholder="Enter campaign title" />
//             </Form.Item>

//             {/* 📌 Campaign Description */}
//             <Form.Item
//               label="Description"
//               name="description"
//               rules={[{ required: true, message: "Please enter a campaign description!" }]}
//             >
//               <TextArea rows={4} placeholder="Describe your campaign..." />
//             </Form.Item>

//             {/* 📌 Funding Goal */}
//             <Form.Item
//               label="Funding Goal ($)"
//               name="goal"
//               rules={[{ required: true, message: "Please set a funding goal!" }]}
//             >
//               <InputNumber min={1} placeholder="Enter goal amount" style={{ width: "100%" }} />
//             </Form.Item>

//             {/* 📌 Campaign Category */}
//             <Form.Item
//               label="Category"
//               name="category"
//               rules={[{ required: true, message: "Please select a campaign category!" }]}
//             >
//               <Select placeholder="Select a category">
//                 <Option value="education">Education</Option>
//                 <Option value="health">Health & Medical</Option>
//                 <Option value="environment">Environment</Option>
//                 <Option value="animals">Animal Welfare</Option>
//                 <Option value="disaster">Disaster Relief</Option>
//                 <Option value="other">Other</Option>
//               </Select>
//             </Form.Item>

//             {/* 📌 Campaign Image Upload */}
//             <Form.Item label="Upload Campaign Image">
//               <Upload
//                 beforeUpload={() => false} // Prevent auto-upload
//                 onChange={handleImageUpload}
//                 showUploadList={{ showRemoveIcon: true }}
//               >
//                 <Button icon={<UploadOutlined />}>Click to Upload</Button>
//               </Upload>
//               {imageFile && <p className={styles.uploadText}>Selected: Image Uploaded</p>}
//             </Form.Item>

//             {/* 📌 Campaign Duration */}
//             <Form.Item
//               label="Campaign Duration"
//               name="duration"
//               rules={[{ required: true, message: "Please select a start & end date!" }]}
//             >
//               <DatePicker.RangePicker style={{ width: "100%" }} />
//             </Form.Item>

//             {/* 📌 Submit Button */}
//             <Form.Item>
//               <Button type="primary" htmlType="submit" className={styles.submitButton} loading={loading}>
//                 {loading ? "Creating..." : "Create Campaign"}
//               </Button>
//             </Form.Item>
//           </Form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CreateCampaign;



import React, { useState } from "react";
import axios from "axios";
import { Form, Input, Button, Upload, Select, DatePicker, InputNumber, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import styles from "./CreateCampaign.module.css"; // Import CSS for styling

const { TextArea } = Input;
const { Option } = Select;

// A helper function to open Cloudinary's Upload Widget and return the uploaded file's URL.
const openCloudinaryWidget = () => {
  return new Promise((resolve, reject) => {
    if (!window.cloudinary) {
      reject("Cloudinary widget not loaded");
      return;
    }
    window.cloudinary.openUploadWidget(
      {
        cloudName: "dljb6uel8", // Your Cloudinary cloud name
        uploadPreset: "impacta", // Your upload preset (unsigned)
        sources: ["local", "url", "camera"],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result && result.event === "success") {
          resolve(result.info.secure_url);
        }
      }
    );
  });
};

const CreateCampaign = () => {
  const [form] = Form.useForm();
  // State for banner file URL (only one)
  const [bannerUrl, setBannerUrl] = useState(null);
  // State for supporting files URLs (multiple)
  const [supportingUrls, setSupportingUrls] = useState([]);
  const [loading, setLoading] = useState(false);

  // Handle Banner Upload using Cloudinary widget
  const handleBannerUpload = async () => {
    try {
      const url = await openCloudinaryWidget();
      setBannerUrl(url);
      message.success("Banner image uploaded successfully.");
    } catch (error) {
      message.error("Failed to upload banner image.");
    }
    return false; // Prevent auto upload
  };

  // Handle Supporting Documents Upload using Cloudinary widget
  const handleSupportingUpload = async () => {
    try {
      const url = await openCloudinaryWidget();
      setSupportingUrls((prev) => [...prev, url]);
      message.success("Supporting document uploaded successfully.");
    } catch (error) {
      message.error("Failed to upload supporting document.");
    }
    return false;
  };

  // Handle Form Submission
  const onFinish = async (values) => {
    // Check if banner image and supporting docs are provided
    if (!bannerUrl) {
      message.error("Please upload a banner image.");
      return;
    }
    if (supportingUrls.length === 0) {
      message.error("Please upload at least one supporting document.");
      return;
    }

    setLoading(true);
    // Convert Date to ISO Format (assuming values.duration is a RangePicker array)
    const formattedDeadline = values.duration[1].toISOString();

    // Prepare API request body for campaign creation
    const campaignData = {
      title: values.title,
      description: values.description,
      target_amount: values.goal,
      deadline: formattedDeadline,
      currency: "USD", // Set default currency
      category: values.category,
      image: bannerUrl, // Use the banner URL from Cloudinary
    };

    try {
      const token = localStorage.getItem("token"); // Get Token from Local Storage
      const response = await axios.post(
        "/api/campaigns",
        campaignData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        message.success("Campaign created successfully!");
        form.resetFields();
        // Extract campaign ID from response
        const campaignId = response.data.campaign ? response.data.campaign.ID : response.data.ID;
        
        // Upload supporting documents individually
        if (supportingUrls.length > 0) {
          for (const fileUrl of supportingUrls) {
            await axios.post(
              "/api/mediafiles",
              {
                campaign_id: campaignId,
                file_type: "supporting_doc",
                url: fileUrl,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );
          }
        }
      } else {
        message.error("Failed to create campaign. Try again.");
      }
    } catch (error) {
      console.error("❌ API Error:", error);
      message.error("Error creating campaign. Check your inputs or try again later.");
    }

    setLoading(false);
    // Reset file states
    setBannerUrl(null);
    setSupportingUrls([]);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.overlay}>
        <div className={styles.formContainer}>
          <h2 className={styles.title}>Create a New Campaign</h2>
          <Form form={form} layout="vertical" onFinish={onFinish} className={styles.form}>
            {/* Campaign Title */}
            <Form.Item
              label="Campaign Title"
              name="title"
              rules={[{ required: true, message: "Please enter a campaign title!" }]}
            >
              <Input placeholder="Enter campaign title" />
            </Form.Item>

            {/* Campaign Description */}
            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true, message: "Please enter a campaign description!" }]}
            >
              <TextArea rows={4} placeholder="Describe your campaign..." />
            </Form.Item>

            {/* Funding Goal */}
            <Form.Item
              label="Funding Goal ($)"
              name="goal"
              rules={[{ required: true, message: "Please set a funding goal!" }]}
            >
              <InputNumber min={1} placeholder="Enter goal amount" style={{ width: "100%" }} />
            </Form.Item>

            {/* Campaign Category */}
            <Form.Item
              label="Category"
              name="category"
              rules={[{ required: true, message: "Please select a campaign category!" }]}
            >
              <Select placeholder="Select a category">
                <Option value="education">Education</Option>
                <Option value="health">Health & Medical</Option>
                <Option value="environment">Environment</Option>
                <Option value="animals">Animal Welfare</Option>
                <Option value="disaster">Disaster Relief</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>

            {/* Banner Image Upload (Required) */}
            <Form.Item label="Upload Banner Image" required>
              <Button icon={<UploadOutlined />} onClick={handleBannerUpload}>
                Click to Upload Banner
              </Button>
              {bannerUrl && (
                <p className={styles.uploadText}>
                  Banner image uploaded: <a href={bannerUrl} target="_blank" rel="noopener noreferrer">{bannerUrl}</a>
                </p>
              )}
            </Form.Item>

            {/* Supporting Documents Upload (Required) */}
            <Form.Item label="Upload Supporting Documents" required>
              <Button icon={<UploadOutlined />} onClick={handleSupportingUpload}>
                Click to Upload Supporting Docs
              </Button>
              {supportingUrls.length > 0 && (
                <ul className={styles.uploadText}>
                  {supportingUrls.map((url, index) => (
                    <li key={index}>
                      <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
                    </li>
                  ))}
                </ul>
              )}
            </Form.Item>

            {/* Campaign Duration */}
            <Form.Item
              label="Campaign Duration"
              name="duration"
              rules={[{ required: true, message: "Please select a start & end date!" }]}
            >
              <DatePicker.RangePicker style={{ width: "100%" }} />
            </Form.Item>

            {/* Submit Button */}
            <Form.Item>
              <Button type="primary" htmlType="submit" className={styles.submitButton} loading={loading}>
                {loading ? "Creating..." : "Create Campaign"}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;

