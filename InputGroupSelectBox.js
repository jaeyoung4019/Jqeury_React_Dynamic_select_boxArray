import {useSelector} from "react-redux";
import SelectBoxComponent from "@/components/basic/include/tagComponent/selectBoxComponent";
import {useEffect, useState} from "react";
import {initFunction} from "@/config/ui.commons";
import Api from "@/utils/api";

const InputGroupSelectBox = ({inputRef , number}) => {

    // 레벨 (1: 운영자, 2: 마스터, 3: 에이전시, 4: 운수사)
    const { level, admin_idx, master_idx, agency_idx } = useSelector((state) => state.usr);


    // 운수사 레벨일 경우 보여주지 않음
    if (level === 4) {
        return null;
    }

    // 1차그룹 목록
    const [masterGroupList, setMasterGroupList] = useState([]);
    const [selectMaster , setSelectMaster] = useState(0);
    // 2차그룹 목록
    const [agencyGroupList, setAgencyGroupList] = useState([]);
    const [selectAgency , setSelectAgency] = useState(0);
    // 3차그룹 목록
    const [companyGroupList, setCompanyGroupList] = useState([]);

    // 그룹 목록 API 호출
    const groupRequest = async (param) => {
        const res = await Api.post("/cmm/division/list" , param);
        if (res.response != null) {
            return res.response;
        }
    }

    const initArray = ["sb"];
    useEffect(() => {
        initFunction(initArray);
        groupRequest( {
            agency_idx: agency_idx || 0,
            master_idx: master_idx || 0,
            admin_idx: admin_idx || 0,
            type: "1"
        }).then(r => {
            setMasterGroupList( () => {
                return r
            })
        })
        return () => {
            setMasterGroupList([])
            setSelectMaster(0)
            setAgencyGroupList([])
            setSelectAgency(0)
            setCompanyGroupList([])
        }
    }, [])

    const masterSelect = (e) => {
        setSelectMaster(() => Number(e.target.value))
    }

    useEffect(() => {
        if (master_idx != null) {
            const select =  $("#master_idx")
            select.val(master_idx);
            select.off("change").on("change", masterSelect);
            select.niceSelect('update');
            setSelectMaster(() => master_idx)
        } else {
            const select =  $("#master_idx")
            select.val("");
            select.off("change").on("change", masterSelect);
            select.niceSelect('update');
        }
    } , [masterGroupList])


    useEffect(() => {
        if (Number(selectMaster) !== 0) {
            groupRequest({
                agency_idx: agency_idx || 0,
                master_idx: Number(selectMaster),
                admin_idx: admin_idx || 0,
                type:"2"
            }).then(r => {
                setAgencyGroupList( () => {
                    return r
                })
            })
        }
    } , [selectMaster])

    const agencySelect = (e) => {
        setSelectAgency(() => Number(e.target.value))
    }

    useEffect(() => {
        if (agency_idx != null) {
            const select = $("#agency_idx")
            select.val(agency_idx);
            select.off("change").on("change", agencySelect);
            select.niceSelect('update');
            setSelectAgency(() => agency_idx)
        } else {
            const select = $("#agency_idx")
            select.val("");
            select.off("change").on("change", agencySelect);
            select.niceSelect('update');
        }
    }, [agencyGroupList])

    useEffect(() => {
        if (Number(selectAgency) !== 0) {
            groupRequest( {
                agency_idx: Number(selectAgency),
                master_idx: Number(selectMaster),
                admin_idx: admin_idx || 0,
                type: "3"
            }).then(r => {
                setCompanyGroupList( () => {
                    return r
                })
            })
        }
    } ,[selectAgency])



    useEffect(() => {
        const select = $("#company_idx")
        select.val("");
        select.niceSelect('update');
    }, [companyGroupList])

    return(
        <div
            className="form-item-wrap col-7 col-xl-4" >
                <div style={{width: 200 , marginRight: 18 }}>
                    <SelectBox inputRef={inputRef} number={Number(number)} level={level} type={"1"} id={"master_idx"} optionList={masterGroupList}/>
                </div>
                <div style={{marginRight: 18 , width: 200}}>
                    <SelectBox inputRef={inputRef} number={Number(number) + 1}  level={level} type={"2"} id={"agency_idx"} optionList={agencyGroupList}/>
                </div>
                <div style={{width: 200}}>
                    <SelectBox inputRef={inputRef} number={Number(number) + 2}  level={level} type={"3"} id={"company_idx"} optionList={companyGroupList}/>
                </div>
        </div>
    )
}

const SelectBox = ({inputRef , optionList , level , type , id , number}) => {
    const isDisabled = () => {
        if (level === 1) {
            return false
        } else if (level === 2) {
            if (type === "1"){
                return true
            } else {
                return false
            }
        } else if (level === 3) {
            if (type === "1" || type === "2"){
                return true
            } else {
                return false
            }
        }
    }

    return (
        <select
                id={id}
                className="form-control custom-select"
                disabled={isDisabled()}
                ref={el => inputRef.current[number] = el}
        >
            <option value={""}>전체</option>
            {optionList != null &&
                optionList.map( (data , i) => {
                    return(
                        <option key={i} value={data?.idx}>{data?.name}</option>
                    )
                })
            }

        </select>
    )
}

export default InputGroupSelectBox;