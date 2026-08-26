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

  await ensureAnonymousSession();

  const cafeAnswers = (answers || []).map((keywords, index) => ({
    cafeIndex: index + 1,
    keywords: keywords || [],
  }));

  const { data, error } = await supabase.rpc('complete_moca_offline_keyword_match', {
    p_student_id: String(studentId).trim(),
    p_answers: cafeAnswers,
  });

  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}
