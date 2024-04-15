import { Outlet, Link } from "react-router-dom";
import styles from "./Layout.module.css";
import Contoso from "../../assets/Contoso.svg";
import { CopyRegular } from "@fluentui/react-icons";
import { Dialog, Stack, TextField, PrimaryButton, DefaultButton } from "@fluentui/react";
import { useContext, useEffect, useState } from "react";
import { HistoryButton, ShareButton, StorageButton } from "../../components/common/Button";
import { AppStateContext } from "../../state/AppProvider";
import { CosmosDBStatus } from "../../api";
import DropZone from './DropZone';
import {uploadFile} from './azureBlobService'


const Layout = () => {
    const [isSharePanelOpen, setIsSharePanelOpen] = useState<boolean>(false);
    const [isStoragePanelOpen, setIsStoragePanelOpen] = useState<boolean>(false);
    const [copyClicked, setCopyClicked] = useState<boolean>(false);
    const [copyText, setCopyText] = useState<string>("Copy URL");
    const [shareLabel, setShareLabel] = useState<string | undefined>("Share");
    const [storageLabel, setStorageLabel] = useState<string | undefined>("Storage");
    const [hideHistoryLabel, setHideHistoryLabel] = useState<string>("Hide chat history");
    const [showHistoryLabel, setShowHistoryLabel] = useState<string>("Show chat history");
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const appStateContext = useContext(AppStateContext)
    const ui = appStateContext?.state.frontendSettings?.ui;

    const handleShareClick = () => {
        setIsSharePanelOpen(true);
    };

    const handleStorageClick = () => {
        setIsStoragePanelOpen(true);
    };

    const handleSharePanelDismiss = () => {
        setIsSharePanelOpen(false);
        setCopyClicked(false);
        setCopyText("Copy URL");
    };

    const handleStoragePanelDismiss = () => {
        setIsStoragePanelOpen(false);
    };

  const handleCopyClick = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopyClicked(true)
  }

  const handleHistoryClick = () => {
    appStateContext?.dispatch({ type: 'TOGGLE_CHAT_HISTORY' })
  }

    // Handle dropped files
    const handleFiles = (files: File[]) => {
        // Process the dropped files here
        // For now, just store them in state
        setUploadedFiles([...uploadedFiles, ...files]);
    };
    
    const handleSaveButtonClick = async () => {
        if (uploadedFiles.length === 0) {
            console.error("No files to upload.");
            return; // Optionally inform the user to select files
        }
    
        // Define the container name where files should be uploaded
        const containerName = import.meta.env.VITE_CONTAINER_NAME; // Replace with your actual container name
    
        try {
            // Iterate over all uploaded files
            const uploadPromises = uploadedFiles.map(file =>
                uploadFile(containerName, file)
            );
    
            // Wait for all files to be uploaded
            const results = await Promise.all(uploadPromises);
    
            // Here you can handle the results of each upload
            console.log("All files uploaded successfully:", results);
    
            // Clear uploaded files state and close the storage panel
            setUploadedFiles([]);
            handleStoragePanelDismiss();
    
            // Optional: Provide user feedback about successful uploads
        } catch (error) {
            // Handle errors for any failed uploads
            console.error("Error uploading files:", error);
    
            // Optional: Provide user feedback about the failure
        }
    };
    

    const handleCancelStorage = () => {
        setUploadedFiles([]); // Clear uploaded files
        handleStoragePanelDismiss(); // Close the storage panel
    };
      

    useEffect(() => {
        if (copyClicked) {
            setCopyText("Copied URL");
        }
    }, [copyClicked]);

  useEffect(() => {}, [appStateContext?.state.isCosmosDBAvailable.status])

    useEffect(() => {
        const handleResize = () => {
          if (window.innerWidth < 480) {
            setShareLabel(undefined)
            setStorageLabel("S")
            setHideHistoryLabel("Hide history")
            setShowHistoryLabel("Show history")
          } else {
            setShareLabel("Share")
            setStorageLabel("Storage")
            setHideHistoryLabel("Hide chat history")
            setShowHistoryLabel("Show chat history")
          }
        };
    
        window.addEventListener('resize', handleResize);
        handleResize();
    
        return () => window.removeEventListener('resize', handleResize);
      }, []);

      return (
        <div className={styles.layout}>
            {/* Header */}
            <header className={styles.header} role={"banner"}>
                {/* Logo and Title */}
                <Stack horizontal verticalAlign="center" horizontalAlign="space-between">
                    <Stack horizontal verticalAlign="center">
                        <img
                            src={ui?.logo ? ui.logo : Contoso}
                            className={styles.headerIcon}
                            aria-hidden="true"
                        />
                        <Link to="/" className={styles.headerTitleContainer}>
                            <h1 className={styles.headerTitle}>{ui?.title}</h1>
                        </Link>
                    </Stack>
                    {/* Buttons */}
                    <Stack horizontal tokens={{ childrenGap: 4 }} className={styles.shareButtonContainer}>
                        {(appStateContext?.state.isCosmosDBAvailable?.status !== CosmosDBStatus.NotConfigured) &&
                            <HistoryButton onClick={handleHistoryClick} text={appStateContext?.state?.isChatHistoryOpen ? hideHistoryLabel : showHistoryLabel} />
                        }
                        {ui?.show_share_button && <ShareButton onClick={handleShareClick} text={shareLabel} />}
                        {ui?.show_storage_button && <StorageButton onClick={handleStorageClick} text={storageLabel} />}
                    </Stack>
                </Stack>
            </header>
            {/* Main content */}
            <Outlet />
            {/* Share dialog */}
            <Dialog
                onDismiss={handleSharePanelDismiss}
                hidden={!isSharePanelOpen}
                styles={{

                    main: [{
                        selectors: {
                            ['@media (min-width: 480px)']: {
                                maxWidth: '600px',
                                background: "#FFFFFF",
                                boxShadow: "0px 14px 28.8px rgba(0, 0, 0, 0.24), 0px 0px 8px rgba(0, 0, 0, 0.2)",
                                borderRadius: "8px",
                                maxHeight: '200px',
                                minHeight: '100px',
                            }
                        }
                    }]
                }}
                dialogContentProps={{
                    title: "Share the web app",
                    showCloseButton: true
                }}
            >
                <Stack horizontal verticalAlign="center" style={{ gap: "8px" }}>
                    <TextField className={styles.urlTextBox} defaultValue={window.location.href} readOnly />
                    <div
                        className={styles.copyButtonContainer}
                        role="button"
                        tabIndex={0}
                        aria-label="Copy"
                        onClick={handleCopyClick}
                        onKeyDown={e => e.key === "Enter" || e.key === " " ? handleCopyClick() : null}
                    >
                        <CopyRegular className={styles.copyButton} />
                        <span className={styles.copyButtonText}>{copyText}</span>
                    </div>
                </Stack>
            </Dialog>
            <Dialog
                onDismiss={handleStoragePanelDismiss}
                hidden={!isStoragePanelOpen}
                styles={{
                    main: [{
                        selectors: {
                            ['@media (min-width: 800px)']: {
                                maxWidth: '90%', 
                                background: "#FFFFFF",
                                boxShadow: "0px 14px 28.8px rgba(0, 0, 0, 0.24), 0px 0px 8px rgba(0, 0, 0, 0.2)",
                                borderRadius: "8px",
                                maxHeight: '600px', 
                                minHeight: '300px',
                            }
                        }
                    }]
                }}
                dialogContentProps={{
                    title: "Add Data to your Chatbot",
                    showCloseButton: true
                }}
            >
                {/* File drop zone */}
                <DropZone onFilesDropped={handleFiles} />

                {/* Uploaded files */}
                {uploadedFiles.length > 0 && (
                    <div className={styles.uploadedFiles}>
                        <p>Uploaded files:</p>
                        <ul>
                            {uploadedFiles.map((file, index) => (
                                <li key={index}>{file.name}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {/* Save and Cancel buttons */}
                <div style={{ textAlign: 'right', marginTop: '20px' }}>
                    <PrimaryButton onClick={handleSaveButtonClick} text="Save" />
                    <DefaultButton onClick={handleCancelStorage} text="Cancel" style={{ marginLeft: '10px' }} />
                </div>
            </Dialog>
        </div>
    );
};

export default Layout
