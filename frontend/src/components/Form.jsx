import axios from "axios";

const Form = () => {
    const uploadFile = () => {
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = function(event) {
            const fileContent = event.target.result;
    
            // Convert file content to ArrayBuffer
            const arrayBuffer = new Uint8Array(fileContent);
    
            // Make POST request using Axios
            axios.post('https://fourfoxagreementform.onrender.com/oauth/callback', arrayBuffer, {
                headers: {
                    'Content-Type': 'application/octet-stream'
                }
            })
            .then(response => {
                console.log('File uploaded successfully:', response);
            })
            .catch(error => {
                console.error('Error uploading file:', error);
            });
        };

        reader.readAsArrayBuffer(file);
    }

    return (
        <>
            <input type="file" id="fileInput"></input>
            <button onClick={uploadFile}>Upload</button>
        </>
    )
}

export default Form;