def score(questions, answers, threshold=50):
    if not questions or len(questions) != len(answers):
        raise ValueError('Answer count must match the final paper')
    if any(a is not None and (type(a) is not int or not 0 <= a <= 3) for a in answers):
        raise ValueError('Answers must be 0–3 or null')
    concepts = {}; correct = 0
    for q,a in zip(questions,answers):
        c=concepts.setdefault(q['topic'],{'correct':0,'total':0})
        hit=int(a==q['answer']);correct+=hit;c['correct']+=hit;c['total']+=1
    for c in concepts.values():
        c['percent']=round(100*c['correct']/c['total']);c['needsSupport']=c['percent']<threshold
    return {'correct':correct,'total':len(questions),'percent':round(100*correct/len(questions)),'concepts':concepts}
def intervention(affected,assessed):
    if not assessed or not affected:return 'NO_ADDITIONAL_SUPPORT'
    if affected/assessed>=.5:return 'WHOLE_CLASS_REVISIT'
    if affected<=4:return '30_MINUTE_SMALL_GROUP'
    return 'TARGETED_PRACTICE'
