def decide_ml_strategy(context: dict) -> dict:
    data_volume = int(context.get('data_volume') or 0)
    has_conversations = bool(context.get('has_conversations'))
    needs_prediction = bool(context.get('needs_prediction'))
    needs_private = bool(context.get('needs_private_ai'))
    should_finetune = has_conversations and data_volume >= 1000
    return {
        'should_use_ml': needs_prediction or data_volume >= 500,
        'should_use_rag': True,
        'should_finetune': should_finetune,
        'local_ai_candidate': needs_private,
        'recommended_stack': ['Python', 'Django', 'Celery', 'Postgres', 'Redis', 'LangGraph', 'MLflow', 'DVC'],
        'notes': [
            'Use RAG antes de fine-tuning quando o problema for conhecimento/documentos.',
            'Use fine-tuning quando houver dataset consistente de conversas/decisões e métrica de qualidade.',
            'Use IA local quando privacidade, custo ou latência forem determinantes.',
        ]
    }
