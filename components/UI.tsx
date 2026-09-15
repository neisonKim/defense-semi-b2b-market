export function Stat({value,label,delta}:{value:string;label:string;delta?:string}){
  return <div className="stat"><span>{label}</span><strong>{value}</strong>{delta && <small>{delta}</small>}</div>
}
export function Badge({children,kind="blue"}:{children:React.ReactNode;kind?:"blue"|"green"|"amber"}){
  return <span className={`badge ${kind}`}>{children}</span>
}
export function SectionTitle({title,sub}:{title:string;sub?:string}){
  return <div className="sectionTitle"><div><h2>{title}</h2>{sub && <p>{sub}</p>}</div></div>
}
