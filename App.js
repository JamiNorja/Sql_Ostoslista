import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList } from 'react-native';
import * as SQLite from 'expo-sqlite';

export default function App() {
  const [product, setProduct] = useState('');
  const [amount, setAmount] = useState('');
  const [shoplist, setShoplist] = useState([]);

  const db = SQLite.openDatabase('shoplistdb.db');

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql('create table if not exists shoplist (id integer primary key not null, product text, amount text);');
    },
      () => console.error("Error when creating DB"),
      updateList);
  }, []);

  const saveItem = () => {
    db.transaction(tx => {
      tx.executeSql('insert into shoplist (product, amount) values (?, ?);',
        [product, amount]);
    },
      null,
      updateList)
  };

  const updateList = () => {
    db.transaction(tx => {
      tx.executeSql('select * from shoplist;', [], (_, { rows }) => {
        console.log('Rows: ', rows)
        setShoplist(rows._array)
      }
      );
    },
      null,
      null);
  };

  const deleteItem = (id) => {
    db.transaction(
    tx => tx.executeSql('delete from shoplist where id = ?;', [id]),
      null,
      updateList)
    }


  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textbox}
        placeholder='Product'
        onChangeText={product => setProduct(product)}
        value={product} />
      <TextInput
        style={styles.textbox}
        placeholder='Amount'
        onChangeText={amount => setAmount(amount)}
        value={amount} />
      <View style={{ paddingTop: 5 }}>
        <Button onPress={saveItem} title="Save" />
      </View>
      <Text style={{ fontSize: 18, paddingTop: 20 }}>Shopping list</Text>
      <FlatList
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) =>
          <View style={styles.listcontainer}>
            <Text style={{ fontSize: 15 }}>{item.product}, {item.amount} </Text>
            <Text style={{ color: '#0000ff' }} onPress={() => deleteItem(item.id)}>bought</Text>
          </View>}
        data={shoplist}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50
  },textbox: {
    borderWidth: 1,
    borderColor: 'grey',
    width: 200,
    marginTop: 5,
  }, listcontainer: {
    marginTop: 5,
    alignContent: 'center',
    flexDirection: 'row',
  }
});
