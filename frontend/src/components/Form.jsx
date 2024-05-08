import axios from "axios";
import { useEffect } from "react";

const Form = () => {
    // const uploadFile = () => {
    //     const fileInput = document.getElementById('fileInput');
    //     const file = fileInput.files[0];
    //     const reader = new FileReader();

    //     reader.onload = function(event) {
    //         const fileContent = event.target.result;
        
    //         // Make POST request using Axios
    //         axios.post('https://fourfoxagreementform.onrender.com/oauth/email', fileContent, {
    //             headers: {
    //                 'Content-Type': 'application/octet-stream'
    //             }
    //         })
    //         .then(response => {
    //             console.log('File uploaded successfully:', response);
    //         })
    //         .catch(error => {
    //             console.error('Error uploading file:', error);
    //         });
    //     };

    //     reader.readAsArrayBuffer(file);
    // }

    useEffect(() => {
        const form = document.querySelector("form");

        form.onsubmit = (event) => {
            event.preventDefault();

            const file = form.querySelector('input[type="file"]').files[0];
            const formData = new FormData();
            formData.append('file', file);

            axios.post('https://fourfoxagreementform.onrender.com/oauth/email', formData).then((res) => {
                console.log("Submit succes" + res);
            }).catch((err) => {
                console.log("Submit unsuces" + err);
            })
        }
    }, [])

    return (
        <>
            <form method="post" encType="multipart/form-data">
                <input type="file" name="pdf" id="fileInput"></input>
                <input type="submit" value="Upload"></input>
            </form>
        </>
    )
}

export default Form;