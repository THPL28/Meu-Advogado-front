import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Rating,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Star as StarIcon,
  ArrowBack as ArrowBackIcon,
  RateReview as ReviewIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { apiGet } from '../../services/api';

interface ReviewDTO {
  reviewId: number;
  contractId: number;
  contractTitle: string;
  reviewerId: number;
  reviewerName: string;
  reviewerPhotoUrl: string | null;
  revieweeId: number;
  revieweeName: string;
  revieweePhotoUrl: string | null;
  revieweeOab: string | null;
  rating: number;
  comment: string;
  createdAt: string;
}

export function MyReviews() {
  const navigate = useNavigate();
  const [receivedReviews, setReceivedReviews] = useState<ReviewDTO[]>([]);
  const [givenReviews, setGivenReviews] = useState<ReviewDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    try {
      setLoading(true);
      const [receivedResp, givenResp] = await Promise.all([
        apiGet<{ success: boolean; data: ReviewDTO[] }>('/api/reviews/received'),
        apiGet<{ success: boolean; data: ReviewDTO[] }>('/api/reviews/given'),
      ]);

      if (receivedResp?.success && receivedResp.data) {
        setReceivedReviews(receivedResp.data);
      }
      if (givenResp?.success && givenResp.data) {
        setGivenReviews(givenResp.data);
      }
    } catch (err) {
      setError('Erro ao carregar avaliações.');
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('pt-BR');

  const calcAverage = (reviews: ReviewDTO[]) => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  };

  const currentReviews = tabIndex === 0 ? receivedReviews : givenReviews;
  const averageRating = calcAverage(currentReviews);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Carregando avaliações...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/home')}
          variant="outlined"
          size="small"
        >
          Voltar
        </Button>
        <ReviewIcon color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h4" fontWeight="bold" sx={{ flexGrow: 1 }}>
          Avaliações
        </Typography>
      </Box>

      {/* Average Rating Card */}
      {currentReviews.length > 0 && (
        <Card sx={{ mb: 3, backgroundColor: 'primary.light', color: 'white' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h2" fontWeight="bold">
              {averageRating.toFixed(1)}
            </Typography>
            <Rating
              value={averageRating}
              precision={0.5}
              readOnly
              icon={<StarIcon sx={{ color: 'white', fontSize: 28 }} />}
              emptyIcon={<StarIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 28 }} />}
            />
            <Typography variant="body1" sx={{ mt: 1 }}>
              {currentReviews.length} {currentReviews.length === 1 ? 'avaliação' : 'avaliações'}
            </Typography>
          </CardContent>
        </Card>
      )}

      <Tabs
        value={tabIndex}
        onChange={(_, v) => setTabIndex(v)}
        sx={{ mb: 3 }}
      >
        <Tab label={`Recebidas (${receivedReviews.length})`} />
        <Tab label={`Enviadas (${givenReviews.length})`} />
      </Tabs>

      {currentReviews.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <ReviewIcon sx={{ fontSize: 64, mb: 2, opacity: 0.4 }} />
          <Typography variant="h6">
            {tabIndex === 0 ? 'Nenhuma avaliação recebida' : 'Nenhuma avaliação enviada'}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {tabIndex === 0
              ? 'As avaliações aparecerão quando outros utilizadores avaliarem o seu trabalho.'
              : 'Avalie os contratos concluídos na página de detalhe do mandato.'}
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 3 }}
            onClick={() => navigate('/contracts')}
          >
            Ver Mandatos
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {currentReviews.map((review) => {
            const subjectName = tabIndex === 0 ? review.reviewerName : review.revieweeName;
            const subjectOab = tabIndex === 0 ? null : review.revieweeOab;
            const subjectPhoto = tabIndex === 0 ? review.reviewerPhotoUrl : review.revieweePhotoUrl;

            return (
              <Grid item xs={12} key={review.reviewId}>
                <Card
                  sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 } }}
                  onClick={() => navigate(`/contracts/${review.contractId}`)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                      <Avatar
                        src={subjectPhoto || undefined}
                        sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}
                      >
                        <PersonIcon />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {subjectName}
                            </Typography>
                            {subjectOab && (
                              <Typography variant="caption" color="text.secondary">
                                OAB: {subjectOab}
                              </Typography>
                            )}
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(review.createdAt)}
                          </Typography>
                        </Box>

                        <Rating
                          value={review.rating}
                          readOnly
                          size="small"
                          sx={{ mt: 0.5 }}
                        />

                        {review.comment && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {review.comment}
                          </Typography>
                        )}

                        <Divider sx={{ my: 1.5 }} />

                        <Typography variant="caption" color="text.secondary">
                          Contrato: {review.contractTitle}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
}
