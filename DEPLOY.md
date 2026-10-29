# Deployment Guide

## Vercel
- افتح Terminal داخل المجلد.
- نفّذ `vercel` لإنشاء Preview.
- اختبر الموقع.
- نفّذ `vercel --prod` للنشر النهائي.

يمكن أيضًا رفع المشروع إلى GitHub ثم استيراده من Vercel. المشروع Static ولا يحتاج build command.

## قبل إطلاق دومين رسمي
- أضف canonical URL بعد معرفة الدومين النهائي.
- اختبر تضمين YouTube.
- اختبر Service Worker على HTTPS.
- شغّل Lighthouse.
- راجع الروابط الخارجية دوريًا لأن فيديوهات YouTube قد تُحذف أو تتغير.
