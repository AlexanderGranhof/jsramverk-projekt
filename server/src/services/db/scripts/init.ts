import dbConn from '../'
;(async () => {
    console.log('waiting for db to connect...')

    const schemas = Object.values(await dbConn)

    console.log('db connected!')
    console.log('emptying db...')

    // const promises = schemas.map((schema) => {
    //     return schema.remove({})
    // })

    // await Promise.all(promises)

    console.log('emptied db!')
})()
