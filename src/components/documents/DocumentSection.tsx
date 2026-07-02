import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  InsertDriveFile as FileIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  TextSnippet as TextIcon,
} from '@mui/icons-material';
import { apiGet, apiDelete } from '../../services/api';
import { getAuthState } from '../../services/authService';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL?.trim()?.replace(/\/+$/, '') || 'http://localhost:8080';

interface DocumentDTO {
  documentId: number;
  contractId: number;
  uploadedById: number;
  uploadedByName: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  description: string;
  category: string;
  createdAt: string;
}

interface DocumentSectionProps {
  contractId: number;
}

const categoryLabels: Record<string, string> = {
  contract: 'Contrato',
  petition: 'Petição',
  evidence: 'Prova',
  identification: 'Identificação',
  judicial: 'Judicial',
  other: 'Outro',
};

export function DocumentSection({ contractId }: DocumentSectionProps) {
  const [documents, setDocuments] = useState<DocumentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const authState = getAuthState();

  useEffect(() => {
    loadDocuments();
  }, [contractId]);

  async function loadDocuments() {
    try {
      const response = await apiGet<{ success: boolean; data: DocumentDTO[] }>(
        `/api/documents/list/${contractId}`
      );
      if (response?.success && response.data) {
        setDocuments(response.data);
      }
    } catch {
      setError('Erro ao carregar documentos.');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', description);
      formData.append('category', category);

      const response = await fetch(
        `${API_BASE_URL}/api/documents/upload/${contractId}`,
        {
          method: 'POST',
          credentials: 'include',
          body: formData,
        }
      );

      if (response.ok) {
        setDescription('');
        setCategory('other');
        loadDocuments();
      } else {
        setError('Erro ao fazer upload do ficheiro.');
      }
    } catch {
      setError('Erro ao fazer upload do ficheiro.');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(documentId: number) {
    try {
      const response = await apiDelete<{ success: boolean }>(`/api/documents/${documentId}`);
      if (response?.success !== false) {
        setDocuments(documents.filter((d) => d.documentId !== documentId));
      }
    } catch {
      setError('Erro ao eliminar documento.');
    }
  }

  function getFileIcon(contentType: string) {
    if (contentType.includes('pdf')) return <PdfIcon color="error" />;
    if (contentType.includes('image')) return <ImageIcon color="primary" />;
    if (contentType.includes('text') || contentType.includes('document'))
      return <TextIcon color="info" />;
    return <FileIcon />;
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('pt-BR');

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <DescriptionIcon color="primary" />
          <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
            Documentos
          </Typography>
          <Chip label={`${documents.length} ficheiro(s)`} size="small" variant="outlined" />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Upload Area */}
        <Box
          sx={{
            border: '2px dashed',
            borderColor: 'primary.light',
            borderRadius: 2,
            p: 2,
            mb: 2,
            textAlign: 'center',
            backgroundColor: 'grey.50',
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
              e.target.value = '';
            }}
          />
          <CloudUploadIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Arraste ficheiros ou clique para fazer upload
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mt: 1 }}>
            <TextField
              size="small"
              placeholder="Descrição (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{ width: 200 }}
            />
            <FormControl size="small" sx={{ width: 150 }}>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={category}
                label="Categoria"
                onChange={(e) => setCategory(e.target.value)}
              >
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <MenuItem key={key} value={key}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? 'A enviar...' : 'Upload'}
            </Button>
          </Box>
        </Box>

        {/* Documents List */}
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : documents.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <FileIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
            <Typography variant="body2">
              Nenhum documento anexado a este mandato.
            </Typography>
          </Box>
        ) : (
          <List>
            {documents.map((doc) => (
              <ListItem
                key={doc.documentId}
                secondaryAction={
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                      edge="end"
                      size="small"
                      component="a"
                      href={`${API_BASE_URL}/api/documents/download/${doc.documentId}`}
                      target="_blank"
                    >
                      <DownloadIcon />
                    </IconButton>
                    {doc.uploadedById === authState.userId && (
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleDelete(doc.documentId)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                }
                sx={{ borderRadius: 1, '&:hover': { backgroundColor: 'action.hover' } }}
              >
                <ListItemIcon>
                  {getFileIcon(doc.contentType)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {doc.fileName}
                      </Typography>
                      <Chip
                        label={categoryLabels[doc.category] || doc.category}
                        size="small"
                        variant="outlined"
                        sx={{ height: 20, fontSize: 10 }}
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      {formatFileSize(doc.fileSize)}
                      {' · '}
                      {formatDate(doc.createdAt)}
                      {' · '}
                      {doc.uploadedByName}
                      {doc.description && ` · ${doc.description}`}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
