# CAFE MOCA Offline — final-swap ready

이 저장소는 **사진만 교체하면 최종 배포할 수 있게** 구성되어 있습니다.

## 최종 사진 슬롯

화면은 3개 카페 × 6장 = 총 18장입니다. 아래 파일명은 코드에서 고정되어 있으므로 **파일 내용만 교체하고 이름은 유지**하면 됩니다.

- `public/offline-feeds/cafe-01/post-01.webp` ~ `post-06.webp`
- `public/offline-feeds/cafe-02/post-01.webp` ~ `post-06.webp`
- `public/offline-feeds/cafe-03/post-01.webp` ~ `post-06.webp`

권장: 정사각형(1:1), 720~1080px, WebP. 피드에서는 `object-fit: cover`로 표시됩니다.

## 키워드

`src/offlineConfig.js`에서 정확히 **45개**를 한 곳에서 관리합니다. 화면 코드는 키워드 배열을 직접 갖지 않습니다.

## 배포 전 체크

1. 사진 18장 교체
2. `npm run build` 통과 확인
3. `main`에 push
4. Vercel 배포 상태 확인

Supabase에는 각 카페에서 선택한 3개 키워드 문자열만 저장하므로, 후보 키워드가 30개에서 45개로 늘어나는 것 때문에 DB 스키마를 수정할 필요는 없습니다.
