import React from "react";

import { Box, TextField } from "@mui/material";
import { StyledButton, StyledSubmitButton } from "../Styles/Styled";
import { useState } from "react";
import Dialog from "@mui/material/Dialog";

/*These are used for both message + uniqueCode modal but got modularized */

// import DialogActions from "@mui/material/DialogActions";
// import DialogContent from "@mui/material/DialogContent";
// import DialogContentText from "@mui/material/DialogContentText";
// import DialogTitle from "@mui/material/DialogTitle";
import displayMessageModal from "./CheckReply Components/displayMessageModal";
import uniqueCodeInputModal from "./CheckReply Components/uniqueCodeModal";

const port = 3001;

function CheckReply() {
  const [check_message, setcheck_message] = useState<any>(null);
  const [openMessageModal, setOpenMessageModal] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [validCode, setValidCode] = useState(false);
  const [codeModalHelperText, setCodeModalHelperText] = useState("");
  const [openInputCodeModal, setOpenInputCodeModal] = useState(false);

  const handleOpenInputCodeModal = () => {
    setOpenInputCodeModal(true);
  };

  const handleCloseInputCodeModal = () => {
    setOpenInputCodeModal(false);
    setCodeModalHelperText("");
  };

  const handleOpenMessageModal = () => {
    setOpenMessageModal(true);
    setOpenInputCodeModal(false);
  };
  const handleCloseMessageModal = () => {
    setOpenMessageModal(false);
  };

  // CHECK REPLY button main function
  const handleCodeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // fetching getmessage endpoint and pass in inputCode in url
    fetch(
      `http://131.252.208.28:${port}/getmessage?code=${encodeURIComponent(
        inputCode
      )}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      // response from fetch
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then((responseJson) => {
        console.log(responseJson);
        setcheck_message(responseJson);
        handleOpenMessageModal();
        setValidCode(true);
        setCodeModalHelperText("");
      })
      // If catching error from endpoint, display error message
      .catch((error) => {
        console.log(error);
        setOpenMessageModal(false);
        setValidCode(false);
        setCodeModalHelperText("Code is invalid. Please try another code.");
      });
  };

  /* Transfer to uniqueCodeInputModal.tsx */

  // const uniqueCodeInputModal = (
  //   <div>
  //     <DialogTitle> Input Unique Code</DialogTitle>
  //     <form noValidate autoComplete="off" onSubmit={handleCodeSubmit}>
  //       <DialogContent>
  //         <DialogContentText>
  //           Please enter provided unique code to view response
  //         </DialogContentText>
  //         <Box textAlign="center" sx={{ padding: "1rem" }}>
  //           <TextField
  //             variant="outlined"
  //             label="Provided Code"
  //             placeholder="Provided Code"
  //             helperText={codeModalHelperText}
  //             sx={{ input: { textAlign: "center" } }}
  //             onChange={(e) => setInputCode(e.target.value)}
  //           ></TextField>
  //         </Box>
  //       </DialogContent>
  //       <DialogActions>
  //         <StyledButton onClick={handleCloseInputCodeModal}>Close</StyledButton>
  //         <StyledSubmitButton variant="contained" type="submit">
  //           Submit
  //         </StyledSubmitButton>
  //       </DialogActions>
  //     </form>
  //   </div>
  // );

  /* Transfer to displayMessageModal.tsx */

  // const displayMessageModal = (
  //   <div>
  //     <DialogTitle sx={{ fontSize: "16px", fontWeight: "bold" }}>
  //       {" "}
  //       Message{" "}
  //     </DialogTitle>
  //     <DialogContent>
  //       {check_message && (
  //         <DialogContentText
  //           sx={{
  //             whiteSpace: "pre-wrap",
  //             overflowWrap: "anywhere",
  //             marginBottom: "16px",
  //           }}
  //         >
  //           <div>
  //             <strong>Sent Message: </strong> <br />
  //             {check_message.message}
  //           </div>
  //           <div style={{ marginTop: "10px" }}>
  //             <strong>Reply: </strong> <br />
  //             {check_message.message_reply}
  //           </div>
  //         </DialogContentText>
  //       )}
  //     </DialogContent>
  //     <DialogActions>
  //       <StyledButton onClick={handleCloseMessageModal}> Close</StyledButton>
  //     </DialogActions>
  //   </div>
  // );

  return (
    //  {/* below are additional features code */}
    <Box textAlign="right" sx={{ height: "38px" }}>
      <StyledButton
        variant="contained"
        onClick={handleOpenInputCodeModal}
        autoFocus
        sx={{
          height: "38px",
          backgroundColor: "#6a7f10",
          color: "rgb(255,255,255)",
          fontSize: "14px",
          justifyContent: "space-between",
          paddingLeft: "16px",
          paddingRight: "16px",
          textAlign: "center",
          "&:hover": {
            backgroundColor: "#1d252d",
            color: "#FFFFFF",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
          },
        }}
      >
        Check Reply
      </StyledButton>
      <Dialog open={openInputCodeModal} onClose={handleCloseInputCodeModal}>
        {uniqueCodeInputModal({
          handleCodeSubmit,
          codeModalHelperText,
          handleCloseInputCodeModal,
          setInputCode,
        })}
      </Dialog>
      <Dialog
        open={openMessageModal}
        onClose={handleCloseMessageModal}
        scroll={"paper"}
      >
        {displayMessageModal({ check_message, handleCloseMessageModal })}
      </Dialog>
    </Box>
  );
}

export default CheckReply;