import { ensureAnonymousSession, isSupabaseConfigured, supabase } from './supabase';

export async function checkOfflineEligibility(studentId) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase 환경변수가 설정되지 않았어요.');
  }

  await ensureAnonymousSession();

  const { data, error } = await supabase.rpc('check_moca_offline_eligibility', {
    p_student_id: String(studentId).trim(),
  });

  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

export async function completeOfflineKeywordMatch(studentId, answers) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase 환경변수가 설정되지 않았어요.');
  }

  const normalizedAnswers = Array.isArray(answers) ? answers : [];
  const isComplete = normalizedAnswers.length === 6 && normalizedAnswers.every(
    (keywords) => Array.isArray(keywords) && keywords.length === 3,
  );

  if (!isComplete) {
    throw new Error('6개 카페에서 각각 키워드 3개를 모두 선택해야 해요.');
  }

  await ensureAnonymousSession();

  const cafeAnswers = normalizedAnswers.map((keywords, index) => ({
    cafeIndex: index + 1,
    keywords,
  }));

  const { data, error } = await supabase.rpc('complete_moca_offline_keyword_match', {
    p_student_id: String(studentId).trim(),
    p_answers: cafeAnswers,
  });

  if (error) throw error;

  const result = Array.isArray(data) ? data[0] : data;

  // DB 함수가 응답 저장 + offline_participated_at 기록을 모두 끝낸 뒤
  // completed 상태와 완료 시각을 반환해야만 프론트에서도 최종 완료로 처리한다.
  if (result?.status === 'completed' && !result?.offlineParticipatedAt) {
    throw new Error('오프라인 참여 완료 시각을 확인하지 못했어요.');
  }

  return result;
}
