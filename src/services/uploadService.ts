import axiosClient from ".";

const uploadServices = {
  upload(files: File[] | FileList | File) {
    const dataFile = new FormData();
    if (files instanceof FileList || Array.isArray(files)) {
      for (let i = 0; i < files.length; i++) {
        dataFile.append("files", files[i]);
      }
    } else {
      dataFile.append("files", files);
    }
    return axiosClient.post(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/v1/Upload`,
      dataFile,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "text/plain",
        },
      }
    );
  },
};

export default uploadServices;
