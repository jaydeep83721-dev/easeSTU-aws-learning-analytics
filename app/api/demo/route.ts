import {sample,analyse} from '@/lib/data';
export async function GET(r:Request){const cls=new URL(r.url).searchParams.get('class')==='8B'?'8B':'8A';return Response.json({source:'synthetic',submissions:sample(cls),analysis:analyse(sample(cls))})}

